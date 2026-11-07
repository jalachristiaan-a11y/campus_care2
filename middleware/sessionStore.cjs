const { createHash, randomBytes } = require('node:crypto');
const db = require('../config/db.cjs');

const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-campuscare.sid'
  : 'campuscare.sid';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const hashSessionId = (sessionId) => createHash('sha256').update(sessionId).digest('hex');

const getSessionId = (req) => {
  const cookies = req.headers.cookie?.split(';') ?? [];
  const sessionCookie = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) return null;

  const sessionId = sessionCookie.slice(SESSION_COOKIE_NAME.length + 1);
  return SESSION_ID_PATTERN.test(sessionId) ? sessionId : null;
};

const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

const setSessionCookie = (res, sessionId) => {
  res.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
};

const createSession = async (userId) => {
  const sessionId = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.query('DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP');
  await db.query(
    `INSERT INTO user_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [hashSessionId(sessionId), userId, expiresAt]
  );

  return sessionId;
};

const destroySession = async (req) => {
  const sessionId = getSessionId(req);
  if (!sessionId) return;

  await db.query('DELETE FROM user_sessions WHERE token_hash = $1', [hashSessionId(sessionId)]);
};

const authenticateSession = async (req, res, next) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    clearSessionCookie(res);
    return res.status(401).json({ message: 'A valid session is required.' });
  }

  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.department_id, d.name AS department
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE s.token_hash = $1 AND s.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [hashSessionId(sessionId)]
    );
    const user = result.rows[0];

    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      department_id: user.department_id,
    };
    req.sessionUser = user;
    return next();
  } catch (error) {
    console.error('Session authentication error:', error);
    return res.status(500).json({ message: 'Unable to verify your session.' });
  }
};

module.exports = {
  authenticateSession,
  clearSessionCookie,
  createSession,
  destroySession,
  getSessionId,
  setSessionCookie,
};

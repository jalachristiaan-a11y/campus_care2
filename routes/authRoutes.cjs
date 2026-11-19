const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db.cjs');
const {
  authenticateSession,
  clearSessionCookie,
  createSession,
  destroySession,
  setSessionCookie,
} = require('../middleware/sessionStore.cjs');

const router = express.Router();
const STUDENT_ID_PATTERN = /^\d{4}-?\d{4,5}$/;
const WMSU_EMAIL_PATTERN = /^[^\s@]+@wmsu\.edu\.ph$/i;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_SEND_LIMIT = 5;
const OTP_MAX_ATTEMPTS = 5;
const corAttachmentPattern = /^(data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,)[A-Za-z0-9+/]+={0,2}$/;

const formatUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  department_id: user.department_id,
  department: user.department || null,
  email_verified_at: user.email_verified_at || null,
  emailVerified: Boolean(user.email_verified_at),
  cor_status: user.cor_status || 'pending',
  corStatus: user.cor_status || 'pending',
  cor_submitted_at: user.cor_submitted_at || null,
  corSubmitted: Boolean(user.cor_submitted_at),
  cor_file_name: user.cor_file_name || null,
  corFileName: user.cor_file_name || null,
});

const createMailer = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

router.post('/verification/send', authenticateSession, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.json({ message: 'Administrators do not require student email verification.' });
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return res.status(503).json({
      message: 'Email verification is not configured. Ask an administrator to configure SMTP.',
    });
  }

  try {
    const sendPermit = await db.query(
      `UPDATE users
       SET email_verification_send_count = CASE
             WHEN email_verification_send_window_started_at IS NULL
               OR email_verification_send_window_started_at <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
             THEN 1
             ELSE email_verification_send_count + 1
           END,
           email_verification_send_window_started_at = CASE
             WHEN email_verification_send_window_started_at IS NULL
               OR email_verification_send_window_started_at <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
             THEN CURRENT_TIMESTAMP
             ELSE email_verification_send_window_started_at
           END,
           email_verification_last_sent_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'student'
         AND (
           email_verification_last_sent_at IS NULL
           OR email_verification_last_sent_at <= CURRENT_TIMESTAMP - INTERVAL '1 minute'
         )
         AND (
           email_verification_send_window_started_at IS NULL
           OR email_verification_send_window_started_at <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
           OR email_verification_send_count < $2
         )
       RETURNING id`,
      [req.user.id, OTP_SEND_LIMIT],
    );
    if (!sendPermit.rows[0]) {
      return res.status(429).json({
        message: 'Too many verification code requests. Wait before requesting another code.',
      });
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    await db.query('DELETE FROM email_verification_codes WHERE user_id = $1', [req.user.id]);
    await db.query(
      `INSERT INTO email_verification_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [req.user.id, codeHash, new Date(Date.now() + OTP_EXPIRY_MS)],
    );

    const mailer = createMailer();
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'CampusCare <no-reply@wmsu.edu.ph>',
      to: req.sessionUser.email,
      subject: 'CampusCare email verification code',
      text: `Your CampusCare verification code is ${code}. It expires in 10 minutes.`,
    });
    return res.json({ message: 'A 6-digit verification code was sent to your WMSU email.' });
  } catch (error) {
    console.error('Email verification send error:', error);
    return res.status(500).json({ message: 'Unable to send the verification code.' });
  }
});

router.post('/verification/verify', authenticateSession, async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Enter the 6-digit verification code.' });
  }

  try {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const result = await db.query(
      `DELETE FROM email_verification_codes
       WHERE user_id = $1
         AND code_hash = $2
         AND expires_at > CURRENT_TIMESTAMP
       RETURNING id`,
      [req.user.id, codeHash],
    );
    if (!result.rows[0]) {
      const failedAttempt = await db.query(
        `UPDATE email_verification_codes
         SET failed_attempts = failed_attempts + 1
         WHERE user_id = $1
           AND expires_at > CURRENT_TIMESTAMP
           AND failed_attempts < $2
         RETURNING id, failed_attempts`,
        [req.user.id, OTP_MAX_ATTEMPTS],
      );
      if (failedAttempt.rows[0]?.failed_attempts >= OTP_MAX_ATTEMPTS) {
        await db.query(
          `DELETE FROM email_verification_codes
           WHERE id = $1 AND failed_attempts >= $2`,
          [failedAttempt.rows[0].id, OTP_MAX_ATTEMPTS],
        );
      }
      return res.status(400).json({ message: 'The verification code is invalid or expired.' });
    }

    await db.query(
      'UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.id],
    );
    const userResult = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.department_id, u.email_verified_at,
              u.cor_status, u.cor_submitted_at,
              u.cor_document->>'name' AS cor_file_name, d.name AS department
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.id = $1`,
      [req.user.id],
    );
    return res.json({ message: 'Email verified.', user: formatUser(userResult.rows[0]) });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Unable to verify the email code.' });
  }
});

router.post('/cor', authenticateSession, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only student accounts can submit a COR.' });
  }
  const document = req.body?.document;
  if (
    !document
    || typeof document !== 'object'
    || typeof document.name !== 'string'
    || typeof document.type !== 'string'
    || typeof document.data !== 'string'
    || document.name.length > 255
    || document.data.length > 2.8 * 1024 * 1024
    || !corAttachmentPattern.test(document.data)
  ) {
    return res.status(400).json({
      message: 'Upload a JPEG, PNG, WebP, or PDF COR smaller than 2 MB.',
    });
  }

  try {
    await db.query(
      `UPDATE users
       SET cor_document = $1::jsonb,
           cor_status = 'pending',
           cor_submitted_at = CURRENT_TIMESTAMP,
           cor_reviewed_at = NULL,
           cor_reviewed_by = NULL
       WHERE id = $2`,
      [JSON.stringify(document), req.user.id],
    );
    return res.json({
      message: 'COR submitted for administrator approval.',
      corStatus: 'pending',
      corSubmitted: true,
      corFileName: document.name,
    });
  } catch (error) {
    console.error('COR submission error:', error);
    return res.status(500).json({ message: 'Unable to submit the COR.' });
  }
});

router.get('/cor', authenticateSession, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can view their own COR submission.' });
  }
  try {
    const result = await db.query(
      `SELECT cor_document
       FROM users
       WHERE id = $1 AND role = 'student'`,
      [req.user.id],
    );
    return res.json({ document: result.rows[0]?.cor_document || null });
  } catch (error) {
    console.error('COR load error:', error);
    return res.status(500).json({ message: 'Unable to load your submitted COR.' });
  }
});

router.get('/students/pending', authenticateSession, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can review student verification records.' });
  }
  try {
    const result = await db.query(
      `SELECT id, full_name, email, email_verified_at, cor_status, cor_document,
              cor_submitted_at
       FROM users
       WHERE role = 'student'
         AND cor_document IS NOT NULL
       ORDER BY cor_submitted_at DESC NULLS LAST, full_name`
    );
    return res.json({ students: result.rows });
  } catch (error) {
    console.error('Pending student review list error:', error);
    return res.status(500).json({ message: 'Unable to load student verification records.' });
  }
});

router.patch('/students/:studentId/cor', authenticateSession, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can review COR submissions.' });
  }
  const studentId = typeof req.params.studentId === 'string' ? req.params.studentId : '';
  const status = req.body?.status;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'COR status must be approved or rejected.' });
  }
  try {
    const result = await db.query(
      `UPDATE users
       SET cor_status = $1,
           cor_reviewed_at = CURRENT_TIMESTAMP,
           cor_reviewed_by = $2
       WHERE id = $3 AND role = 'student'
       RETURNING id, full_name, email, cor_status, cor_reviewed_at`,
      [status, req.user.id, studentId],
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Student account not found.' });
    }
    return res.json({ message: `COR ${status}.`, student: result.rows[0] });
  } catch (error) {
    console.error('COR review error:', error);
    return res.status(500).json({ message: 'Unable to review the COR.' });
  }
});

// ==========================================
// REGISTER ROUTE (POST /api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
  const { id, first_name, last_name, full_name, email, password } = req.body || {};
  const studentId = typeof id === 'string'
    ? id.trim().replace(/^(\d{4})(\d{4,5})$/, '$1-$2')
    : '';
  const firstName = typeof first_name === 'string' ? first_name.trim() : '';
  const lastName = typeof last_name === 'string' ? last_name.trim() : '';
  const fullName = typeof full_name === 'string'
    ? full_name.trim()
    : [firstName, lastName].filter(Boolean).join(' ');
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (
    !STUDENT_ID_PATTERN.test(studentId) ||
    !fullName ||
    fullName.length > 100 ||
    !WMSU_EMAIL_PATTERN.test(normalizedEmail) ||
    typeof password !== 'string' ||
    password.length < PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES
  ) {
    return res.status(400).json({
      message: 'Enter a valid student ID, first name, last name, WMSU email, and a password between 8 and 72 bytes.',
    });
  }

  try {
    const existingUser = await db.query(
      `SELECT id FROM users WHERE lower(email) = $1 OR id = $2 LIMIT 1`,
      [normalizedEmail, studentId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this student ID or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (id, full_name, email, password_hash, department_id, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, role, department_id,
                 email_verified_at, cor_status`,
      [
        studentId,
        fullName,
        normalizedEmail,
        hashedPassword,
        null,
        'student'
      ]
    );

    const newUser = result.rows[0];

    return res.status(201).json({
      message: 'Registration successful.',
      user: formatUser(newUser),
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with this student ID or email already exists.' });
    }

    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error while registering.' });
  }
});

// ==========================================
// LOGIN ROUTE (POST /api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
  const { identifier, email, password } = req.body || {};
  const loginIdentifier = typeof identifier === 'string' ? identifier.trim().toLowerCase()
    : typeof email === 'string' ? email.trim().toLowerCase()
      : '';

  if (!loginIdentifier || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Student ID or email and password are required.' });
  }

  try {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.department_id,
              u.email_verified_at, u.cor_status, u.cor_submitted_at,
              u.cor_document->>'name' AS cor_file_name, d.name AS department
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE lower(u.email) = $1
          OR lower(u.id) = $1
          OR (
            $1 ~ '^[0-9-]+$'
            AND regexp_replace(u.id, '[^0-9]', '', 'g') = regexp_replace($1, '[^0-9]', '', 'g')
          )
       LIMIT 1`,
      [loginIdentifier]
    );
    const user = result.rows[0];

    let passwordMatches = false;
    if (user) {
      const storedPassword = user.password_hash;
      if (storedPassword.startsWith('$2')) {
        passwordMatches = await bcrypt.compare(password, storedPassword);
      } else if (storedPassword === password) {
        passwordMatches = true;
        const upgradedHash = await bcrypt.hash(password, 12);
        await db.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [upgradedHash, user.id]
        );
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const sessionId = await createSession(user.id);
    setSessionCookie(res, sessionId);

    return res.json({
      message: 'Login successful.',
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
});

router.get('/session', authenticateSession, (req, res) => (
  res.json({ user: formatUser(req.sessionUser) })
));

router.post('/logout', async (req, res) => {
  try {
    await destroySession(req);
    clearSessionCookie(res);
    return res.status(204).end();
  } catch (error) {
    console.error('Logout Error:', error);
    clearSessionCookie(res);
    return res.status(500).json({ message: 'Unable to end your session.' });
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return process.env.JWT_SECRET;
};

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (error) {
    console.error('Authentication configuration error:', error.message);
    return res.status(500).json({ message: 'Authentication is not configured.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    (typeof payload.id !== 'string' && typeof payload.id !== 'number') ||
    typeof payload.role !== 'string'
  ) {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }

  req.user = {
    id: payload.id,
    role: payload.role,
    department_id: payload.department_id ?? null
  };

  return next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  return next();
};

module.exports = { authenticateToken, authorizeRoles };
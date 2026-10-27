const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs');

const router = express.Router();
const STUDENT_ID_PATTERN = /^\d{4}-?\d{4,5}$/;
const WMSU_EMAIL_PATTERN = /^[^\s@]+@wmsu\.edu\.ph$/i;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      department_id: user.department_id,
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    }
  );
};

const formatUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  department_id: user.department_id,
  department: user.department || null,
});

// ==========================================
// REGISTER ROUTE (POST /api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
  const { id, full_name, email, password } = req.body || {};
  const studentId = typeof id === 'string'
    ? id.trim().replace(/^(\d{4})(\d{4,5})$/, '$1-$2')
    : '';
  const fullName = typeof full_name === 'string' ? full_name.trim() : '';
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
      message: 'Enter a valid student ID, full name, WMSU email, and a password between 8 and 72 bytes.',
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
       RETURNING id, full_name, email, role, department_id`,
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
      token: createToken(newUser)
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
      `SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.department_id, d.name AS department
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

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      message: 'Login successful.',
      user: formatUser(user),
      token: createToken(user)
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
});

module.exports = router;
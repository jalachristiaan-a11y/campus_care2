const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs');

const router = express.Router();
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
      expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Fixed typo: expiresIn
    }
  );
};

const formatUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  department_id: user.department_id
});

router.post('/register', async (req, res) => {
  const { full_name, email, password } = req.body || {};

  if (
    typeof full_name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !full_name.trim() ||
    !email.trim() ||
    password.length < PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES
  ) {
    return res.status(400).json({
      message: 'Provide a name, email, and password between 8 and 72 bytes.'
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, 'student', NULL)
       RETURNING id, full_name, email, role, department_id`,
      [full_name.trim(), email.trim().toLowerCase(), passwordHash]
    );
    const user = result.rows[0];

    return res.status(201).json({
      message: 'Account created successfully.',
      user: formatUser(user),
      token: createToken(user)
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error while creating account.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await db.query(
      `SELECT id, full_name, email, password_hash, role, department_id
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
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
const express = require('express');
const db = require('../config/db.cjs');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware.cjs');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  if (!['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to view notices.' });
  }

  try {
    const result = req.user.role === 'admin'
      ? await db.query(
        `SELECT m.id, m.subject, m.message, m.type, m.sent_at,
                u.email AS recipient_email, u.id AS recipient_student_id,
                u.full_name AS recipient_name
         FROM student_messages m
         JOIN users u ON u.id = m.recipient_user_id
         ORDER BY m.sent_at DESC`
      )
      : await db.query(
        `SELECT m.id, m.subject, m.message, m.type, m.sent_at,
                u.email AS recipient_email, u.id AS recipient_student_id,
                u.full_name AS recipient_name
         FROM student_messages m
         JOIN users u ON u.id = m.recipient_user_id
         WHERE m.recipient_user_id = $1
         ORDER BY m.sent_at DESC`,
        [req.user.id]
      );

    return res.json({
      notices: result.rows.map((row) => ({
        id: `NOT-${row.id}`,
        subject: row.subject,
        message: row.message,
        type: row.type,
        sentAt: row.sent_at.toISOString(),
        recipientEmail: row.recipient_email,
        recipientStudentId: row.recipient_student_id,
        recipientName: row.recipient_name,
        recipient: `${row.recipient_name} (${row.recipient_student_id})`,
        date: new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(row.sent_at)),
        status: 'Delivered',
      })),
    });
  } catch (error) {
    console.error('Notice list error:', error);
    return res.status(500).json({ message: 'Unable to load notices.' });
  }
});

router.post('/', authorizeRoles('admin'), async (req, res) => {
  const recipientEmail = typeof req.body?.recipientEmail === 'string'
    ? req.body.recipientEmail.trim().toLowerCase()
    : '';
  const recipientStudentId = typeof req.body?.recipientStudentId === 'string'
    ? req.body.recipientStudentId.trim()
    : '';
  const subject = typeof req.body?.subject === 'string'
    ? req.body.subject.trim()
    : '';
  const message = typeof req.body?.message === 'string'
    ? req.body.message.trim()
    : '';
  const type = typeof req.body?.type === 'string'
    ? req.body.type.trim()
    : 'Official Notice';

  if (
    (!recipientEmail && !recipientStudentId)
    || subject.length > 200
    || !message
    || message.length > 5000
    || !type
    || type.length > 60
  ) {
    return res.status(400).json({
      message: 'Provide a student email or ID, a message up to 5000 characters, and a valid notice type.',
    });
  }

  try {
    const recipientResult = await db.query(
      `SELECT id, email, full_name
       FROM users
       WHERE role = 'student'
         AND (($1 <> '' AND lower(email) = $1) OR ($2 <> '' AND id = $2))
       LIMIT 2`,
      [recipientEmail, recipientStudentId]
    );
    if (recipientResult.rows.length === 0) {
      return res.status(404).json({ message: 'No registered student matches that email or ID.' });
    }
    if (recipientResult.rows.length > 1) {
      return res.status(400).json({ message: 'The email and student ID refer to different accounts.' });
    }

    const recipient = recipientResult.rows[0];
    const result = await db.query(
      `INSERT INTO student_messages (sender_user_id, recipient_user_id, subject, message, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, subject, message, type, sent_at`,
      [req.user.id, recipient.id, subject || 'Official Portal Notice', message, type]
    );
    const notice = result.rows[0];

    return res.status(201).json({
      notice: {
        id: `NOT-${notice.id}`,
        subject: notice.subject,
        message: notice.message,
        type: notice.type,
        sentAt: notice.sent_at.toISOString(),
        recipientEmail: recipient.email,
        recipientStudentId: recipient.id,
        recipientName: recipient.full_name,
        recipient: `${recipient.full_name} (${recipient.id})`,
        date: new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(notice.sent_at)),
        status: 'Delivered',
      },
    });
  } catch (error) {
    console.error('Notice send error:', error);
    return res.status(500).json({ message: 'Unable to send notice.' });
  }
});

module.exports = router;

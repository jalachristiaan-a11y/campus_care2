const crypto = require('node:crypto');
const express = require('express');
const db = require('../config/db.cjs');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware.cjs');

const router = express.Router();
const allowedCategories = new Set([
  'Academic Affairs',
  'Campus Facilities',
  'Financial Aid',
  'Student Services',
  'Safety and Security',
  'Other',
]);
const allowedStatuses = new Set(['Under Review', 'In Progress', 'Resolved']);
const attachmentPattern = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

const formatComplaint = (row) => {
  const submittedAt = row.created_at.toISOString();
  const statusClass = row.status === 'Resolved'
    ? 'closed'
    : row.status === 'Withdrawn'
      ? 'withdrawn'
    : row.status === 'In Progress'
      ? 'progress'
      : 'review';

  return {
    id: row.public_id,
    category: row.category,
    title: row.title,
    description: row.description,
    location: row.location,
    status: row.status,
    statusClass,
    department: row.department,
    updated: `${row.status} · ${new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(row.updated_at))}`,
    submittedAt,
    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name,
    studentId: row.student_id,
    studentDepartment: row.student_department || '',
    attachment: row.attachment,
  };
};

const formatActivity = (row) => ({
  id: row.id,
  type: row.event_type,
  message: row.message,
  actor: row.actor_name || (row.actor_role === 'admin' ? 'CampusCare Administrator' : 'Student'),
  actorRole: row.actor_role,
  createdAt: row.created_at.toISOString(),
});

router.use(authenticateToken);

router.get('/', async (req, res) => {
  if (!['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to view complaints.' });
  }

  try {
    const result = req.user.role === 'admin'
      ? await db.query(
        `SELECT c.public_id, c.category, c.title, c.description, c.location, c.status,
                c.department, c.created_at, c.updated_at, c.submitted_by,
                c.submitted_by_name, c.student_id, c.attachment, d.name AS student_department
         FROM complaints c
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN departments d ON d.id = u.department_id
         ORDER BY c.created_at DESC`
      )
      : await db.query(
        `SELECT c.public_id, c.category, c.title, c.description, c.location, c.status,
                c.department, c.created_at, c.updated_at, c.submitted_by,
                c.submitted_by_name, c.student_id, c.attachment, d.name AS student_department
         FROM complaints c
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN departments d ON d.id = u.department_id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id]
      );

    return res.json({ complaints: result.rows.map(formatComplaint) });
  } catch (error) {
    console.error('Complaint list error:', error);
    return res.status(500).json({ message: 'Unable to load complaints.' });
  }
});

router.post('/', authorizeRoles('student'), async (req, res) => {
  const body = req.body || {};
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const attachment = body.attachment ?? null;

  if (
    !allowedCategories.has(category)
    || !title
    || title.length > 120
    || !description
    || description.length > 3000
    || location.length > 120
  ) {
    return res.status(400).json({
      message: 'Provide a valid category, a subject up to 120 characters, and details up to 3000 characters.',
    });
  }

  if (
    attachment !== null
    && (
      typeof attachment !== 'object'
      || typeof attachment.name !== 'string'
      || typeof attachment.type !== 'string'
      || typeof attachment.data !== 'string'
      || attachment.name.length > 255
      || attachment.data.length > 2.8 * 1024 * 1024
      || !attachmentPattern.test(attachment.data)
      || !attachment.data.startsWith(`data:${attachment.type};base64,`)
    )
  ) {
    return res.status(400).json({ message: 'The attachment must be a JPEG, PNG, WebP, or GIF image up to 2 MB.' });
  }

  try {
    const settingsResult = await db.query(
      `SELECT value->>'intakeOpen' AS intake_open
       FROM system_settings
       WHERE setting_key = $1`,
      ['portal'],
    );
    if (!settingsResult.rows[0]) {
      return res.status(503).json({ message: 'Complaint intake is not configured. Please contact an administrator.' });
    }
    if (settingsResult.rows[0].intake_open === 'false') {
      return res.status(403).json({ message: 'Complaint submissions are temporarily paused. Please try again later.' });
    }

    const userResult = await db.query(
      `SELECT u.id, u.email, u.full_name, d.name AS department
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.id = $1 AND u.role = 'student'`,
      [req.user.id]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(403).json({ message: 'A student account is required to file a complaint.' });
    }

    const publicId = `CMP-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const result = await db.query(
      `WITH inserted AS (
         INSERT INTO complaints (
           public_id, user_id, submitted_by, submitted_by_name, student_id,
           category, title, description, location, attachment
         )
         VALUES ($1, $2, $3, $4, $2, $5, $6, $7, $8, $9::jsonb)
         RETURNING id, public_id, category, title, description, location, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment
       ), logged AS (
         INSERT INTO complaint_activity (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $2, 'student', 'submitted', 'Complaint submitted.' FROM inserted
       )
       SELECT * FROM inserted`,
      [
        publicId,
        user.id,
        user.email,
        user.full_name,
        category,
        title,
        description,
        location,
        attachment ? JSON.stringify(attachment) : null,
      ]
    );
    return res.status(201).json({
      complaint: formatComplaint({ ...result.rows[0], student_department: user.department }),
    });
  } catch (error) {
    console.error('Complaint submission error:', error);
    return res.status(500).json({ message: 'Unable to save your complaint. Please try again.' });
  }
});

router.get('/:complaintId/activity', async (req, res) => {
  if (!['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to view complaint activity.' });
  }

  try {
    const result = await db.query(
      `SELECT a.id, a.event_type, a.message, a.actor_role, a.created_at,
              u.full_name AS actor_name
       FROM complaint_activity a
       JOIN complaints c ON c.id = a.complaint_id
       LEFT JOIN users u ON u.id = a.actor_user_id
       WHERE c.public_id = $1 AND ($2 = 'admin' OR c.user_id = $3)
       ORDER BY a.created_at ASC, a.id ASC`,
      [req.params.complaintId, req.user.role, req.user.id],
    );
    if (!result.rows.length) {
      const complaint = await db.query(
        `SELECT 1 FROM complaints
         WHERE public_id = $1 AND ($2 = 'admin' OR user_id = $3)`,
        [req.params.complaintId, req.user.role, req.user.id],
      );
      if (!complaint.rows[0]) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }
    }

    return res.json({ activity: result.rows.map(formatActivity) });
  } catch (error) {
    console.error('Complaint activity load error:', error);
    return res.status(500).json({ message: 'Unable to load complaint activity.' });
  }
});

router.post('/:complaintId/responses', authorizeRoles('admin'), async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 3000) {
    return res.status(400).json({ message: 'Enter a response up to 3000 characters.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO complaint_activity
         (complaint_id, actor_user_id, actor_role, event_type, message)
       SELECT id, $2, 'admin', 'response', $3
       FROM complaints
       WHERE public_id = $1 AND status <> 'Withdrawn'
       RETURNING id, event_type, message, actor_role, created_at`,
      [req.params.complaintId, req.user.id, message],
    );
    if (!result.rows[0]) {
      const complaint = await db.query(
        'SELECT status FROM complaints WHERE public_id = $1',
        [req.params.complaintId],
      );
      if (!complaint.rows[0]) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }
      return res.status(409).json({ message: 'Responses cannot be added to a withdrawn complaint.' });
    }

    return res.status(201).json({
      activity: formatActivity({ ...result.rows[0], actor_name: 'CampusCare Administrator' }),
    });
  } catch (error) {
    console.error('Complaint response save error:', error);
    return res.status(500).json({ message: 'Unable to save complaint response.' });
  }
});

router.patch('/:complaintId', authorizeRoles('student'), async (req, res) => {
  const body = req.body || {};
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const attachment = body.attachment ?? null;

  if (
    !allowedCategories.has(category)
    || !title
    || title.length > 120
    || !description
    || description.length > 3000
    || location.length > 120
  ) {
    return res.status(400).json({
      message: 'Provide a valid category, a subject up to 120 characters, and details up to 3000 characters.',
    });
  }

  if (
    attachment !== null
    && (
      typeof attachment !== 'object'
      || typeof attachment.name !== 'string'
      || typeof attachment.type !== 'string'
      || typeof attachment.data !== 'string'
      || attachment.name.length > 255
      || attachment.data.length > 2.8 * 1024 * 1024
      || !attachmentPattern.test(attachment.data)
      || !attachment.data.startsWith(`data:${attachment.type};base64,`)
    )
  ) {
    return res.status(400).json({ message: 'The attachment must be a JPEG, PNG, WebP, or GIF image up to 2 MB.' });
  }

  try {
    const result = await db.query(
      `WITH updated AS (
         UPDATE complaints
         SET category = $1, title = $2, description = $3, location = $4,
             attachment = $5::jsonb, updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $6 AND user_id = $7 AND status = 'Under Review'
         RETURNING id, public_id, category, title, description, location, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment
       ), logged AS (
         INSERT INTO complaint_activity (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $7, 'student', 'edited', 'Complaint details updated by student.' FROM updated
       )
       SELECT * FROM updated`,
      [
        category,
        title,
        description,
        location,
        attachment ? JSON.stringify(attachment) : null,
        req.params.complaintId,
        req.user.id,
      ],
    );
    if (result.rows[0]) {
      return res.json({ complaint: formatComplaint(result.rows[0]) });
    }

    const existing = await db.query(
      'SELECT status FROM complaints WHERE public_id = $1 AND user_id = $2',
      [req.params.complaintId, req.user.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    return res.status(409).json({ message: 'Only complaints under review can be edited.' });
  } catch (error) {
    console.error('Complaint edit error:', error);
    return res.status(500).json({ message: 'Unable to update complaint.' });
  }
});

router.delete('/:complaintId', authorizeRoles('student'), async (req, res) => {
  try {
    const result = await db.query(
      `WITH updated AS (
         UPDATE complaints
         SET status = 'Withdrawn', updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $1 AND user_id = $2 AND status = 'Under Review'
         RETURNING id, public_id, category, title, description, location, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment
       ), logged AS (
         INSERT INTO complaint_activity (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $2, 'student', 'withdrawn', 'Complaint withdrawn by student.' FROM updated
       )
       SELECT * FROM updated`,
      [req.params.complaintId, req.user.id],
    );
    if (result.rows[0]) {
      return res.json({ complaint: formatComplaint(result.rows[0]) });
    }

    const existing = await db.query(
      'SELECT status FROM complaints WHERE public_id = $1 AND user_id = $2',
      [req.params.complaintId, req.user.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    return res.status(409).json({ message: 'Only complaints under review can be withdrawn.' });
  } catch (error) {
    console.error('Complaint withdrawal error:', error);
    return res.status(500).json({ message: 'Unable to withdraw complaint.' });
  }
});

router.patch('/:complaintId/status', authorizeRoles('admin'), async (req, res) => {
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
  const resolutionNote = typeof req.body?.resolutionNote === 'string'
    ? req.body.resolutionNote.trim()
    : '';
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ message: 'Choose a valid complaint status.' });
  }
  if (
    status === 'Resolved'
    && (!resolutionNote || resolutionNote.length > 3000)
  ) {
    return res.status(400).json({ message: 'Add a resolution note up to 3000 characters before resolving this complaint.' });
  }

  try {
    const result = await db.query(
      `WITH updated AS (
         UPDATE complaints
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $2 AND status <> 'Withdrawn'
         RETURNING id, public_id, category, title, description, location, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment
       ), logged AS (
         INSERT INTO complaint_activity
           (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $3, 'admin', $4, $5 FROM updated
       )
       SELECT * FROM updated`,
      [
        status,
        req.params.complaintId,
        req.user.id,
        status === 'Resolved' ? 'resolution' : 'status',
        status === 'Resolved' ? resolutionNote : `Status changed to ${status}.`,
      ],
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    return res.json({ complaint: formatComplaint(result.rows[0]) });
  } catch (error) {
    console.error('Complaint status update error:', error);
    return res.status(500).json({ message: 'Unable to update complaint status.' });
  }
});

router.patch('/:complaintId/department', authorizeRoles('admin'), async (req, res) => {
  const department = typeof req.body?.department === 'string'
    ? req.body.department.trim()
    : '';
  if (!department || department.length > 100) {
    return res.status(400).json({ message: 'Choose a valid department.' });
  }

  try {
    const result = await db.query(
      `WITH updated AS (
         UPDATE complaints
         SET department = $1, updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $2
         RETURNING id, public_id, category, title, description, location, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment
       ), logged AS (
         INSERT INTO complaint_activity
           (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $3, 'admin', 'assignment', $4 FROM updated
       )
       SELECT * FROM updated`,
      [department, req.params.complaintId, req.user.id, `Assigned to ${department}.`]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    return res.json({ complaint: formatComplaint(result.rows[0]) });
  } catch (error) {
    console.error('Complaint reassignment error:', error);
    return res.status(500).json({ message: 'Unable to reassign complaint.' });
  }
});

module.exports = router;

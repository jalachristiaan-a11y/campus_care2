const crypto = require('node:crypto');
const express = require('express');
const db = require('../config/db.cjs');
const { authenticateSession, authorizeRoles } = require('../middleware/authMiddleware.cjs');

const router = express.Router();
const allowedCategories = new Set([
  'Academic Affairs',
  'Campus Facilities',
  'Financial Aid',
  'Student Services',
  'Safety and Security',
  'Other',
]);
const allowedStatuses = new Set([
  'Under Review',
  'Need More Information',
  'In Progress',
  'Resolved',
  'Rejected',
  'Closed',
]);
const attachmentPattern = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;
const complaintDetailsQuery = `
  SELECT c.*, reviewer.full_name AS reviewer_name, d.name AS student_department
  FROM complaints c
  LEFT JOIN users student ON student.id = c.user_id
  LEFT JOIN departments d ON d.id = student.department_id
  LEFT JOIN users reviewer ON reviewer.id = c.assigned_admin_id
  WHERE c.id = $1
`;

const formatComplaint = (row, { includeReviewerId = false } = {}) => {
  const submittedAt = row.created_at.toISOString();
  const statusClass = row.status === 'Resolved'
    ? 'closed'
    : row.status === 'Closed'
      ? 'closed'
    : row.status === 'Rejected'
      ? 'rejected'
    : row.status === 'Need More Information'
      ? 'needs-info'
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
    urgency: Number(row.urgency ?? 1),
    status: row.status,
    statusClass,
    department: row.department,
    assignedReviewerName: row.reviewer_name || '',
    reviewerAssigned: Boolean(row.assigned_admin_id),
    ...(includeReviewerId ? { assignedReviewerId: row.assigned_admin_id || '' } : {}),
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
  actor: row.actor_name || (
    row.actor_role === 'admin'
      ? 'CampusCare Administrator'
      : row.actor_role === 'system'
        ? 'CampusCare System'
        : 'Student'
  ),
  actorRole: row.actor_role,
  createdAt: row.created_at.toISOString(),
});

router.use(authenticateSession);

router.get('/', async (req, res) => {
  if (!['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to view complaints.' });
  }

  try {
    const result = req.user.role === 'admin'
      ? await db.query(
        `SELECT c.public_id, c.category, c.title, c.description, c.location, c.urgency, c.status,
                c.department, c.assigned_admin_id, reviewer.full_name AS reviewer_name,
                c.created_at, c.updated_at, c.submitted_by,
                c.submitted_by_name, c.student_id, c.attachment, d.name AS student_department
         FROM complaints c
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN departments d ON d.id = u.department_id
         LEFT JOIN users reviewer ON reviewer.id = c.assigned_admin_id
         ORDER BY c.created_at DESC`
      )
      : await db.query(
        `SELECT c.public_id, c.category, c.title, c.description, c.location, c.urgency, c.status,
                c.department, c.assigned_admin_id, reviewer.full_name AS reviewer_name,
                c.created_at, c.updated_at, c.submitted_by,
                c.submitted_by_name, c.student_id, c.attachment, d.name AS student_department
         FROM complaints c
         LEFT JOIN users u ON u.id = c.user_id
         LEFT JOIN departments d ON d.id = u.department_id
         LEFT JOIN users reviewer ON reviewer.id = c.assigned_admin_id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [req.user.id]
      );

    return res.json({
      complaints: result.rows.map((row) => formatComplaint(row, {
        includeReviewerId: req.user.role === 'admin',
      })),
    });
  } catch (error) {
    console.error('Complaint list error:', error);
    return res.status(500).json({ message: 'Unable to load complaints.' });
  }
});

router.get('/reviewers', authorizeRoles('admin'), async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name
       FROM users
       WHERE role = 'admin'
       ORDER BY full_name, id`,
    );
    return res.json({
      reviewers: result.rows.map((row) => ({ id: row.id, fullName: row.full_name })),
    });
  } catch (error) {
    console.error('Complaint reviewers load error:', error);
    return res.status(500).json({ message: 'Unable to load complaint reviewers.' });
  }
});

router.post('/', authorizeRoles('student'), async (req, res) => {
  const body = req.body || {};
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const urgency = body.urgency === undefined ? 1 : Number(body.urgency);
  const attachment = body.attachment ?? null;

  if (
    !allowedCategories.has(category)
    || !title
    || title.length > 120
    || !description
    || description.length > 3000
    || location.length > 120
    || !Number.isInteger(urgency)
    || urgency < 1
    || urgency > 4
  ) {
    return res.status(400).json({
      message: 'Provide a valid category, subject, details, and an urgency level from 1 to 4.',
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
    const eligibility = await db.query(
      `SELECT email_verified_at, cor_status
       FROM users
       WHERE id = $1 AND role = 'student'`,
      [req.user.id],
    );
    const student = eligibility.rows[0];
    if (!student?.email_verified_at) {
      return res.status(403).json({
        message: 'Verify your WMSU email before filing a complaint.',
      });
    }
    if (student.cor_status !== 'approved') {
      return res.status(403).json({
        message: 'Your COR must be approved by an administrator before filing a complaint.',
      });
    }
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
           category, title, description, location, attachment, urgency
         )
         VALUES ($1, $2, $3, $4, $2, $5, $6, $7, $8, $9::jsonb, $10)
         RETURNING id, public_id, category, title, description, location, urgency, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment, assigned_admin_id, user_id
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
        urgency,
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

router.post('/:complaintId/responses', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 3000) {
    return res.status(400).json({ message: 'Enter a response up to 3000 characters.' });
  }

  if (req.user.role === 'student') {
    try {
      const result = await db.query(
        `WITH updated AS (
           UPDATE complaints
           SET status = 'Under Review', updated_at = CURRENT_TIMESTAMP
           WHERE public_id = $1 AND user_id = $2 AND status = 'Need More Information'
           RETURNING id, public_id, category, title, description, location, urgency, status,
                     department, created_at, updated_at, submitted_by,
                     submitted_by_name, student_id, attachment, assigned_admin_id
         ), logged AS (
           INSERT INTO complaint_activity
             (complaint_id, actor_user_id, actor_role, event_type, message)
           SELECT id, $2, 'student', 'additional_information', $3 FROM updated
           RETURNING id, complaint_id, event_type, message, actor_role, created_at
         ), status_logged AS (
           INSERT INTO complaint_activity
             (complaint_id, actor_user_id, actor_role, event_type, message)
           SELECT id, NULL, 'system', 'status',
                  'Status changed to Under Review after the student provided additional information.'
           FROM updated
         )
         SELECT updated.*, logged.id AS activity_id,
                logged.event_type AS activity_type,
                logged.message AS activity_message,
                logged.actor_role AS activity_actor_role,
                logged.created_at AS activity_created_at,
                reviewer.full_name AS reviewer_name
         FROM updated
         JOIN logged ON logged.complaint_id = updated.id
         LEFT JOIN users reviewer ON reviewer.id = updated.assigned_admin_id`,
        [req.params.complaintId, req.user.id, message],
      );
      if (!result.rows[0]) {
        const existing = await db.query(
          'SELECT status FROM complaints WHERE public_id = $1 AND user_id = $2',
          [req.params.complaintId, req.user.id],
        );
        if (!existing.rows[0]) {
          return res.status(404).json({ message: 'Complaint not found.' });
        }
        return res.status(409).json({
          message: 'Additional information can only be sent when the complaint requests more information.',
        });
      }

      const row = result.rows[0];
      return res.status(201).json({
        complaint: formatComplaint(row),
        activity: formatActivity({
          id: row.activity_id,
          event_type: row.activity_type,
          message: row.activity_message,
          actor_role: row.activity_actor_role,
          actor_name: req.user.full_name,
          created_at: row.activity_created_at,
        }),
      });
    } catch (error) {
      console.error('Student additional information save error:', error);
      return res.status(500).json({ message: 'Unable to submit additional information.' });
    }
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You do not have permission to respond to complaints.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO complaint_activity
         (complaint_id, actor_user_id, actor_role, event_type, message)
       SELECT id, $2, 'admin', 'response', $3
       FROM complaints
       WHERE public_id = $1
         AND status NOT IN ('Resolved', 'Rejected', 'Withdrawn', 'Closed')
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
      if (['Resolved', 'Rejected', 'Withdrawn', 'Closed'].includes(complaint.rows[0].status)) {
        return res.status(409).json({
          message: 'Responses cannot be added after a complaint is resolved, rejected, withdrawn, or closed.',
        });
      }
      return res.status(409).json({ message: 'The complaint status changed. Reload it before responding.' });
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
  const urgency = body.urgency === undefined ? 1 : Number(body.urgency);
  const attachment = body.attachment ?? null;

  if (
    !allowedCategories.has(category)
    || !title
    || title.length > 120
    || !description
    || description.length > 3000
    || location.length > 120
    || !Number.isInteger(urgency)
    || urgency < 1
    || urgency > 4
  ) {
    return res.status(400).json({
    message: 'Provide a valid category, subject, details, and an urgency level from 1 to 4.',
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
             urgency = $5, attachment = $6::jsonb,
             updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $7 AND user_id = $8
           AND status = 'Submitted' AND assigned_admin_id IS NULL
         RETURNING id, public_id, category, title, description, location, urgency, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment, assigned_admin_id
       ), logged AS (
         INSERT INTO complaint_activity (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $8, 'student', 'edited', 'Complaint details updated by student.'
         FROM updated
       )
       SELECT updated.*, reviewer.full_name AS reviewer_name
       FROM updated
       LEFT JOIN users reviewer ON reviewer.id = updated.assigned_admin_id`,
      [
        category,
        title,
        description,
        location,
        urgency,
        attachment ? JSON.stringify(attachment) : null,
        req.params.complaintId,
        req.user.id,
      ],
    );
    if (result.rows[0]) {
      return res.json({ complaint: formatComplaint(result.rows[0]) });
    }

    const existing = await db.query(
      'SELECT status, assigned_admin_id FROM complaints WHERE public_id = $1 AND user_id = $2',
      [req.params.complaintId, req.user.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    return res.status(409).json({
      message: existing.rows[0].assigned_admin_id
        ? 'An administrator has started reviewing this complaint, so it can no longer be edited.'
        : 'Only complaints waiting for review can be edited.',
    });
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
         WHERE public_id = $1 AND user_id = $2
           AND status = 'Submitted' AND assigned_admin_id IS NULL
         RETURNING id, public_id, category, title, description, location, urgency, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment, assigned_admin_id
       ), logged AS (
         INSERT INTO complaint_activity (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $2, 'student', 'withdrawn', 'Complaint withdrawn by student.' FROM updated
       )
       SELECT updated.*, reviewer.full_name AS reviewer_name
       FROM updated
       LEFT JOIN users reviewer ON reviewer.id = updated.assigned_admin_id`,
      [req.params.complaintId, req.user.id],
    );
    if (result.rows[0]) {
      return res.json({ complaint: formatComplaint(result.rows[0]) });
    }

    const existing = await db.query(
      'SELECT status, assigned_admin_id FROM complaints WHERE public_id = $1 AND user_id = $2',
      [req.params.complaintId, req.user.id],
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    if (existing.rows[0].assigned_admin_id) {
      return res.status(409).json({
        message: 'An administrator has claimed this complaint, so it can no longer be withdrawn.',
      });
    }
    return res.status(409).json({ message: 'Only complaints waiting for review can be withdrawn.' });
  } catch (error) {
    console.error('Complaint withdrawal error:', error);
    return res.status(500).json({ message: 'Unable to withdraw complaint.' });
  }
});

router.patch('/:complaintId/status', authorizeRoles('admin'), async (req, res) => {
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
  const statusNote = typeof req.body?.statusNote === 'string'
    ? req.body.statusNote.trim()
    : typeof req.body?.resolutionNote === 'string'
      ? req.body.resolutionNote.trim()
    : '';
  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ message: 'Choose a valid complaint status.' });
  }
  if (
    ['Resolved', 'Rejected', 'Need More Information'].includes(status)
    && (!statusNote || statusNote.length > 3000)
  ) {
    return res.status(400).json({
      message: `Add a note up to 3000 characters before setting this complaint to ${status.toLowerCase()}.`,
    });
  }
  if (statusNote.length > 3000) {
    return res.status(400).json({ message: 'The status note must be 3000 characters or fewer.' });
  }

  try {
    const result = await db.query(
      `WITH updated AS (
         UPDATE complaints
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE public_id = $2
           AND (
             ($1 = 'Under Review' AND status = 'Need More Information')
             OR ($1 = 'Need More Information' AND status IN ('Under Review', 'In Progress'))
             OR ($1 = 'In Progress' AND status IN ('Under Review', 'Need More Information', 'Resolved', 'Rejected', 'Closed'))
             OR ($1 = 'Resolved' AND status IN ('Under Review', 'Need More Information', 'In Progress'))
             OR ($1 = 'Rejected' AND status IN ('Under Review', 'Need More Information', 'In Progress'))
             OR ($1 = 'Closed' AND status = 'Resolved')
           )
         RETURNING id, public_id, category, title, description, location, urgency, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment, assigned_admin_id
       ), logged AS (
         INSERT INTO complaint_activity
           (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $3, 'admin', $4, $5 FROM updated
       )
       SELECT updated.*, reviewer.full_name AS reviewer_name
       FROM updated
       LEFT JOIN users reviewer ON reviewer.id = updated.assigned_admin_id`,
      [
        status,
        req.params.complaintId,
        req.user.id,
        status === 'Resolved' ? 'resolution' : 'status',
        statusNote || `Status changed to ${status}.`,
      ],
    );
    if (!result.rows[0]) {
      const existing = await db.query(
        'SELECT status FROM complaints WHERE public_id = $1',
        [req.params.complaintId],
      );
      if (!existing.rows[0]) {
        return res.status(404).json({ message: 'Complaint not found.' });
      }
      return res.status(409).json({
        message: `A complaint with status ${existing.rows[0].status} cannot be changed to ${status}.`,
      });
    }

    return res.json({
      complaint: formatComplaint(result.rows[0], { includeReviewerId: true }),
    });
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
         RETURNING id, public_id, category, title, description, location, urgency, status,
                   department, created_at, updated_at, submitted_by,
                   submitted_by_name, student_id, attachment, assigned_admin_id
       ), logged AS (
         INSERT INTO complaint_activity
           (complaint_id, actor_user_id, actor_role, event_type, message)
         SELECT id, $3, 'admin', 'assignment', $4 FROM updated
       )
       SELECT updated.*, reviewer.full_name AS reviewer_name
       FROM updated
       LEFT JOIN users reviewer ON reviewer.id = updated.assigned_admin_id`,
      [department, req.params.complaintId, req.user.id, `Assigned to ${department}.`]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    return res.json({
      complaint: formatComplaint(result.rows[0], { includeReviewerId: true }),
    });
  } catch (error) {
    console.error('Complaint reassignment error:', error);
    return res.status(500).json({ message: 'Unable to reassign complaint.' });
  }
});

router.patch('/:complaintId/reviewer', authorizeRoles('admin'), async (req, res) => {
  const reviewerId = typeof req.body?.reviewerId === 'string'
    ? req.body.reviewerId.trim()
    : '';
  if (!reviewerId || reviewerId.length > 20) {
    return res.status(400).json({ message: 'Choose an administrator to review this complaint.' });
  }

  let client;
  let transactionOpen = false;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    transactionOpen = true;

    const complaintResult = await client.query(
      `SELECT c.id, c.public_id, c.user_id, c.assigned_admin_id,
              previous_reviewer.full_name AS previous_reviewer_name, c.status
       FROM complaints c
       LEFT JOIN users previous_reviewer ON previous_reviewer.id = c.assigned_admin_id
       WHERE c.public_id = $1
       FOR UPDATE OF c`,
      [req.params.complaintId],
    );
    const complaint = complaintResult.rows[0];
    if (!complaint) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (['Resolved', 'Rejected', 'Withdrawn', 'Closed'].includes(complaint.status)) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return res.status(409).json({ message: 'Only active complaints can be assigned to a reviewer.' });
    }

    const reviewerResult = await client.query(
      `SELECT id, full_name
       FROM users
       WHERE id = $1 AND role = 'admin'`,
      [reviewerId],
    );
    const reviewer = reviewerResult.rows[0];
    if (!reviewer) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return res.status(400).json({ message: 'The selected reviewer is not an administrator.' });
    }

    if (complaint.assigned_admin_id === reviewer.id) {
      const currentResult = await client.query(complaintDetailsQuery, [complaint.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      return res.json({
        complaint: formatComplaint(currentResult.rows[0], { includeReviewerId: true }),
      });
    }

    const isReassignment = Boolean(complaint.assigned_admin_id);
    await client.query(
      `UPDATE complaints
       SET assigned_admin_id = $1, assigned_at = CURRENT_TIMESTAMP,
           status = CASE WHEN assigned_admin_id IS NULL THEN 'Under Review' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [reviewer.id, complaint.id],
    );

    const activityMessage = isReassignment
      ? `Review reassigned from ${complaint.previous_reviewer_name || 'another administrator'} to ${reviewer.full_name}.`
      : `Review assigned to ${reviewer.full_name}. Status changed to Under Review.`;
    await client.query(
      `INSERT INTO complaint_activity
         (complaint_id, actor_user_id, actor_role, event_type, message)
       VALUES ($1, $2, 'admin', $3, $4)`,
      [
        complaint.id,
        req.user.id,
        isReassignment ? 'reviewer_reassigned' : 'reviewer_assigned',
        activityMessage,
      ],
    );

    if (complaint.user_id) {
      const subject = isReassignment
        ? 'Your complaint reviewer changed'
        : 'A reviewer was assigned to your complaint';
      const notificationMessage = isReassignment
        ? `Your complaint ${complaint.public_id} is now assigned to ${reviewer.full_name}.`
        : `Your complaint ${complaint.public_id} is now under review with ${reviewer.full_name}.`;
      await client.query(
        `INSERT INTO student_messages
           (sender_user_id, recipient_user_id, subject, message, type)
         VALUES ($1, $2, $3, $4, 'Complaint Update')`,
        [req.user.id, complaint.user_id, subject, notificationMessage],
      );
    }

    const updatedResult = await client.query(complaintDetailsQuery, [complaint.id]);
    await client.query('COMMIT');
    transactionOpen = false;
    return res.json({
      complaint: formatComplaint(updatedResult.rows[0], { includeReviewerId: true }),
    });
  } catch (error) {
    if (client && transactionOpen) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Complaint reviewer assignment rollback error:', rollbackError);
      }
    }
    console.error('Complaint reviewer assignment error:', error);
    return res.status(500).json({ message: 'Unable to assign the complaint reviewer.' });
  } finally {
    client?.release();
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/db.cjs');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  if (!['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to view portal settings.' });
  }

  try {
    const result = await db.query(
      'SELECT value FROM system_settings WHERE setting_key = $1',
      ['portal'],
    );
    if (!result.rows[0]) {
      return res.status(503).json({ message: 'Portal settings are not initialized. Run npm run db:init.' });
    }

    const settings = req.user.role === 'admin'
      ? result.rows[0].value
      : { intakeOpen: result.rows[0].value.intakeOpen };
    return res.json({ settings });
  } catch (error) {
    console.error('Portal settings load error:', error);
    return res.status(500).json({ message: 'Unable to load portal settings.' });
  }
});

router.put('/', authorizeRoles('admin'), async (req, res) => {
  const { intakeOpen, slaHours, urgentSlaHours } = req.body || {};
  const parsedSlaHours = Number(slaHours);
  const parsedUrgentSlaHours = Number(urgentSlaHours);

  if (
    typeof intakeOpen !== 'boolean'
    || !Number.isInteger(parsedSlaHours)
    || parsedSlaHours < 1
    || parsedSlaHours > 720
    || !Number.isInteger(parsedUrgentSlaHours)
    || parsedUrgentSlaHours < 1
    || parsedUrgentSlaHours > 720
  ) {
    return res.status(400).json({
      message: 'Provide an intake status and valid SLA windows from 1 to 720 hours.',
    });
  }

  const settings = {
    intakeOpen,
    slaHours: parsedSlaHours,
    urgentSlaHours: parsedUrgentSlaHours,
  };

  try {
    const result = await db.query(
      `INSERT INTO system_settings (setting_key, value, updated_by)
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (setting_key) DO UPDATE
       SET value = EXCLUDED.value,
           updated_by = EXCLUDED.updated_by,
           updated_at = CURRENT_TIMESTAMP
       RETURNING value`,
      ['portal', JSON.stringify(settings), req.user.id],
    );
    return res.json({ settings: result.rows[0].value });
  } catch (error) {
    console.error('Portal settings save error:', error);
    return res.status(500).json({ message: 'Unable to save portal settings.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// GET /routes test endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Complaint routes working successfully' });
});

module.exports = router;
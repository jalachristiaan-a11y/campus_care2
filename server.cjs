require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured.');
}

const express = require('express');
const path = require('node:path');
const db = require('./config/db.cjs');
const authRoutes = require('./routes/authRoutes.cjs');
const complaintRoutes = require('./routes/complaintRoutes.cjs');
const noticeRoutes = require('./routes/noticeRoutes.cjs');
const settingsRoutes = require('./routes/settingsRoutes.cjs');

const app = express();
app.use(express.json({ limit: '3mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check database error:', error);
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

const distDirectory = path.join(__dirname, 'dist');
app.use(express.static(distDirectory));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(distDirectory, 'index.html'), (error) => {
    if (error) next(error);
  });
});

const port = Number(process.env.PORT || 5000);

db.query('SELECT 1')
  .then(() => {
    app.listen(port, () => {
      console.log(`CampusCare API listening on port ${port}; PostgreSQL connected.`);
    });
  })
  .catch(async (error) => {
    console.error('Unable to start CampusCare API because PostgreSQL is unavailable:', error.message);
    await db.end();
    process.exitCode = 1;
  });
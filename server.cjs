const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes.cjs');
const complaintRoutes = require('./routes/complaintRoutes.cjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UniResolve Express API is running' });
});

// Start Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
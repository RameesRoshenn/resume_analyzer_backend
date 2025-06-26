require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');

const app = express();

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors({
  origin: 'https://resume-analyzer-frontend-sigma.vercel.app/',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', analyzeRouter); // This prefixes all analyzeRouter routes with /api

// Test endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      analyze: 'POST /api/analyze'
    }
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: {
      status: 'GET /api/status',
      analyze: 'POST /api/analyze'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log(`- GET  http://localhost:${PORT}/api/status`);
  console.log(`- POST http://localhost:${PORT}/api/analyze`);
  console.log('API Key Status:', process.env.GEMINI_API_KEY ? 'Exists' : 'Missing');
});
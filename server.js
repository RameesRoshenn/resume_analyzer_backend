require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRouter = require('./routes/analyze');

const app = express();

// ✅ Allowed origins: localhost and Vercel frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://resume-analyzer-frontend-sigma.vercel.app'
];

// ✅ Robust CORS setup for Render & Vercel
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// ✅ Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Main route
app.use('/api', analyzeRouter);

// ✅ Status check route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      analyze: 'POST /api/analyze'
    }
  });
});

// ✅ 404 handler
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

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api/status`);
  console.log(`📨 POST /api/analyze`);
  console.log(`🔑 GEMINI API Key: ${process.env.GEMINI_API_KEY ? 'Exists' : 'Missing'}`);
});

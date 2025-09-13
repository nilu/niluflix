// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.DESKTOP_APP_PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for serving the Electron renderer if needed)
app.use('/static', express.static(path.join(__dirname, '../renderer')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NiluFlix API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes (placeholders for now)
app.get('/api/movies/popular', (req, res) => {
  res.json({
    message: 'Popular movies endpoint - coming soon!',
    data: [],
  });
});

app.get('/api/tv/popular', (req, res) => {
  res.json({
    message: 'Popular TV shows endpoint - coming soon!',
    data: [],
  });
});

app.get('/api/downloads', (req, res) => {
  res.json({
    message: 'Downloads endpoint - coming soon!',
    downloads: [],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 NiluFlix API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎬 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;

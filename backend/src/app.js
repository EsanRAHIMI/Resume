// /backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Import routes
const uploadRoutes = require('./routes/upload');
const resumeRoutes = require('./routes/resume');
const authRoutes = require('./routes/auth');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize the app asynchronously
async function initializeApp() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    
    // Session middleware (after DB connection)
    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-here',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        touchAfter: 24 * 3600 // lazy session update
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      }
    }));

    // API Routes (after session middleware is set up)
    app.use('/api/auth', authRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/resume', resumeRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: ['authentication', 'resume-management', 'file-upload']
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Resume Builder API v2.0 - User Management & Resume Storage',
        endpoints: {
          auth: '/api/auth',
          upload: '/api/upload',
          resumes: '/api/resume'
        },
        documentation: 'https://your-docs-url.com'
      });
    });

    // API documentation endpoint
    app.get('/api', (req, res) => {
      res.json({
        message: 'Resume Builder API v2.0',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/me',
          updateProfile: 'PUT /api/auth/profile'
        },
        resumes: {
          list: 'GET /api/resume',
          get: 'GET /api/resume/:id',
          create: 'POST /api/resume',
          update: 'PUT /api/resume/:id',
          delete: 'DELETE /api/resume/:id',
          duplicate: 'POST /api/resume/:id/duplicate',
          search: 'GET /api/resume/search?q=query'
        },
        upload: {
          parseResume: 'POST /api/upload'
        }
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`
      });
    });

    // Global error handling middleware
    app.use((err, req, res, next) => {
      console.error('Global error handler:', err.stack);
      
      // Mongoose validation error
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
          error: 'Validation Error',
          details: errors
        });
      }
      
      // Mongoose duplicate key error
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
          error: `Duplicate ${field}`,
          message: `${field} already exists`
        });
      }
      
      // JWT error
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token'
        });
      }
      
      // Default error
      res.status(err.status || 500).json({ 
        error: process.env.NODE_ENV === 'production' 
          ? 'Something went wrong!' 
          : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Resume Builder API v2.0 running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    });

  } catch (err) {
    console.error('❌ Application initialization error:', err);
    process.exit(1);
  }
}

// Initialize the application
initializeApp();

module.exports = app;
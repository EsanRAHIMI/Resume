// /backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check for token in headers or session
    let token = null;
    
    // First try Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Then try session
    if (!token && req.session && req.session.token) {
      token = req.session.token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        requiresAuth: true 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Token is valid but user not found.',
        requiresAuth: true 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        requiresAuth: true 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.',
        requiresAuth: true 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during authentication.' 
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token && req.session && req.session.token) {
      token = req.session.token;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = { auth, optionalAuth };
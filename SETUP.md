# 🚀 Resume Builder Pro - Complete Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Features Overview](#features-overview)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **MongoDB** (v5+) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, Linux Ubuntu 18.04+

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd resume-builder-pro
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🔑 Environment Setup

### 1. Backend Environment Variables

Create `backend/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/resume-builder

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key-min-32-chars

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Service
OPENAI_API_KEY=sk-your-openai-api-key-here

# Security
CORS_ORIGIN=http://localhost:3000
```

### 2. Frontend Environment Variables (Optional)

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 3. Generate Secure Keys

For production, generate secure keys:
```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ Database Setup

### 1. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or with Homebrew on macOS
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 2. Initialize Database
```bash
cd backend
npm run init-db
```

This will:
- Create database indexes
- Create demo user (development only)
- Set up collections

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve build folder with your web server
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 🧪 Testing

### 1. Test API Endpoints
```bash
cd backend
npm test
```

### 2. Manual Testing

**Demo Account (Development):**
- Email: `demo@resumebuilder.com`
- Password: `demo123`

**Test New Account:**
1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in details and register
4. Test all features

### 3. Feature Testing Checklist

- [ ] User registration/login
- [ ] File upload (PDF, DOCX, DOC, TXT)
- [ ] Resume parsing with AI
- [ ] Resume editing
- [ ] Live preview
- [ ] PDF generation
- [ ] Resume saving
- [ ] Resume management (list, edit, delete, duplicate)
- [ ] Search functionality

## ✨ Features Overview

### 🔐 Authentication System
- **Secure Registration/Login**
- **JWT Token Authentication**
- **Session Management**
- **Password Hashing (bcrypt)**

### 📄 Resume Management
- **Create/Edit/Delete Resumes**
- **Named Resume Storage** (e.g., "Software Engineer - Google")
- **Resume Duplication**
- **Search & Filter**
- **Auto-save Feature**

### 🤖 AI-Powered Features
- **Resume Parsing** (PDF, DOCX, DOC, TXT)
- **Smart Data Extraction**
- **Content Structuring**

### 📱 User Experience
- **Professional Live Preview**
- **Client-side PDF Generation**
- **Responsive Design**
- **Drag & Drop Upload**
- **Real-time Editing**

## 🌐 Deployment

### Production Environment Setup

1. **Environment Variables**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-builder
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
```

2. **Security Considerations**
- Use HTTPS in production
- Set secure cookie flags
- Enable CORS for production domain only
- Use environment-specific API keys
- Enable rate limiting

### Deployment Options

**Option A: Traditional VPS/VDS**
```bash
# Build frontend
cd frontend
npm run build

# Copy build files to web server
# Start backend with PM2
npm install -g pm2
pm2 start backend/src/app.js --name "resume-builder"
```

**Option B: Docker**
```dockerfile
# Create Dockerfile for backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

**Option C: Cloud Platforms**
- **Heroku**: Easy deployment with git
- **Vercel**: Great for frontend
- **Railway**: Full-stack deployment
- **AWS/Google Cloud**: Scalable production

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
# or
brew services start mongodb-community
```

**2. OpenAI API Error**
```
Error: Invalid API key
```
**Solution**: 
- Check your OpenAI API key in `.env`
- Ensure you have credits in your OpenAI account
- Verify the key format: `sk-...`

**3. Port Already in Use**
```
Error: listen EADDRINUSE :::5001
```
**Solution**:
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env file
```

**4. CORS Errors**
```
Access-Control-Allow-Origin error
```
**Solution**: Check `FRONTEND_URL` in backend `.env` matches frontend URL

**5. JWT Token Issues**
```
Error: Invalid token
```
**Solution**: 
- Clear browser localStorage
- Check JWT_SECRET is consistent
- Token may have expired

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=*
```

### Database Reset

If you need to reset the database:
```bash
cd backend
npm run reset-db
npm run init-db
```

## 📞 Support

If you encounter issues:

1. **Check the logs** in terminal
2. **Verify environment variables** are correct
3. **Test API endpoints** with the test script
4. **Check MongoDB connection**
5. **Verify OpenAI API key** is valid

## 🎉 Success!

If everything is working correctly, you should see:

1. ✅ Backend running on http://localhost:5001
2. ✅ Frontend running on http://localhost:3000  
3. ✅ Database connected and initialized
4. ✅ Authentication system working
5. ✅ File upload and AI parsing functional
6. ✅ PDF generation working
7. ✅ Resume management features working

**Welcome to Resume Builder Pro v2.0!** 🚀

---

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Resume Management Endpoints
- `GET /api/resume` - Get all user resumes
- `GET /api/resume/:id` - Get specific resume
- `POST /api/resume` - Create new resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/:id/duplicate` - Duplicate resume
- `GET /api/resume/search?q=query` - Search resumes

### File Upload Endpoints
- `POST /api/upload` - Upload and parse resume file

### Health Check
- `GET /health` - API health status
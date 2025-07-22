const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { parseResume } = require('../services/resumeParser');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const ensureUploadDirs = async () => {
  try {
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('uploads/resumes', { recursive: true });
    await fs.mkdir('uploads/photos', { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

// Initialize upload directories
ensureUploadDirs();

// Configure multer for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      cb(null, 'uploads/photos/');
    } else {
      cb(null, 'uploads/resumes/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for both resumes and photos
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      // Photo validation
      const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedImageTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for photos!'));
      }
    } else {
      // Resume validation
      const allowedResumeTypes = /pdf|docx|doc|txt/;
      const extname = allowedResumeTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedResumeTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed for resumes!'));
      }
    }
  }
});

// Upload and parse resume
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📄 Processing file:', req.file.originalname);
    
    // Parse the uploaded resume
    const parsedData = await parseResume(req.file.path, req.file.mimetype);
    
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      data: parsedData
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      message: error.message 
    });
  }
});

// Upload photo for resume
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    console.log('📸 Processing photo:', req.file.originalname);

    // Process image with Sharp for optimization
    const processedImagePath = req.file.path.replace(path.extname(req.file.path), '_processed.jpg');
    
    await sharp(req.file.path)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(processedImagePath);

    // Remove original file
    await fs.unlink(req.file.path);

    // Get processed file stats
    const stats = await fs.stat(processedImagePath);

    const photoData = {
      filename: path.basename(processedImagePath),
      originalName: req.file.originalname,
      mimeType: 'image/jpeg',
      size: stats.size,
      uploadDate: new Date()
    };

    res.json({
      success: true,
      message: 'Photo uploaded and processed successfully',
      photo: photoData
    });

  } catch (error) {
    console.error('❌ Photo upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process photo',
      message: error.message 
    });
  }
});

// Get photo file
router.get('/photo/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/photos', filename);
    
    // Check if file exists and send it
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        console.error('Photo serve error:', err);
        res.status(404).json({ error: 'Photo not found' });
      }
    });
  } catch (error) {
    console.error('❌ Photo serve error:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

// Delete photo
router.delete('/photo/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/photos', filename);
    
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('❌ Photo delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete photo',
      message: error.message 
    });
  }
});

module.exports = router;
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  personalInfo: {
    name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    summary: String,
    // Photo fields
    photo: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    showPhoto: {
      type: Boolean,
      default: true
    }
  },
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    duration: String,
    gpa: String
  }],
  skills: [String],
  certifications: [String],
  languages: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String]
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
resumeSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Index for better query performance
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ user: 1, title: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
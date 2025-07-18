const express = require('express');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resume
// @desc    Get all resumes for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const resumes = await Resume.find({ 
      user: req.user.id, 
      isActive: true 
    })
    .sort({ lastModified: -1 })
    .skip(skip)
    .limit(limit)
    .select('title description personalInfo.name personalInfo.title createdAt lastModified');

    const totalResumes = await Resume.countDocuments({ 
      user: req.user.id, 
      isActive: true 
    });

    res.json({
      success: true,
      resumes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResumes / limit),
        totalResumes,
        hasNextPage: page < Math.ceil(totalResumes / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      error: 'Server error while fetching resumes'
    });
  }
});

// @route   GET /api/resume/:id
// @desc    Get a specific resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    res.json({
      success: true,
      resume
    });

  } catch (error) {
    console.error('Get resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid resume ID'
      });
    }
    
    res.status(500).json({
      error: 'Server error while fetching resume'
    });
  }
});

// @route   POST /api/resume
// @desc    Create a new resume
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      description,
      personalInfo, 
      experience, 
      education, 
      skills, 
      certifications, 
      languages, 
      projects 
    } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Resume title is required'
      });
    }

    // Create resume
    const resume = new Resume({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      personalInfo: personalInfo || {},
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      certifications: certifications || [],
      languages: languages || ['English'],
      projects: projects || []
    });

    await resume.save();

    // Add resume to user's resumes array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { resumes: resume._id }
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      resume
    });

  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({
      error: 'Server error while creating resume'
    });
  }
});

// @route   PUT /api/resume/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { 
      title, 
      description,
      personalInfo, 
      experience, 
      education, 
      skills, 
      certifications, 
      languages, 
      projects 
    } = req.body;

    // Find resume
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Validation
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        error: 'Resume title cannot be empty'
      });
    }

    // Update fields
    if (title !== undefined) resume.title = title.trim();
    if (description !== undefined) resume.description = description.trim();
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;
    if (certifications !== undefined) resume.certifications = certifications;
    if (languages !== undefined) resume.languages = languages;
    if (projects !== undefined) resume.projects = projects;

    await resume.save();

    res.json({
      success: true,
      message: 'Resume updated successfully',
      resume
    });

  } catch (error) {
    console.error('Update resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid resume ID'
      });
    }
    
    res.status(500).json({
      error: 'Server error while updating resume'
    });
  }
});

// @route   DELETE /api/resume/:id
// @desc    Delete a resume (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Soft delete
    resume.isActive = false;
    await resume.save();

    // Remove from user's resumes array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { resumes: resume._id }
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid resume ID'
      });
    }
    
    res.status(500).json({
      error: 'Server error while deleting resume'
    });
  }
});

// @route   POST /api/resume/:id/duplicate
// @desc    Duplicate a resume
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!originalResume) {
      return res.status(404).json({
        error: 'Resume not found'
      });
    }

    // Create duplicate
    const duplicateResume = new Resume({
      user: req.user.id,
      title: `${originalResume.title} (Copy)`,
      description: originalResume.description,
      personalInfo: originalResume.personalInfo,
      experience: originalResume.experience,
      education: originalResume.education,
      skills: originalResume.skills,
      certifications: originalResume.certifications,
      languages: originalResume.languages,
      projects: originalResume.projects
    });

    await duplicateResume.save();

    // Add to user's resumes array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { resumes: duplicateResume._id }
    });

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      resume: duplicateResume
    });

  } catch (error) {
    console.error('Duplicate resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid resume ID'
      });
    }
    
    res.status(500).json({
      error: 'Server error while duplicating resume'
    });
  }
});

// @route   GET /api/resume/search
// @desc    Search resumes by title or description
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const resumes = await Resume.find({
      user: req.user.id,
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'personalInfo.name': { $regex: q, $options: 'i' } },
        { 'personalInfo.title': { $regex: q, $options: 'i' } }
      ]
    })
    .sort({ lastModified: -1 })
    .limit(20)
    .select('title description personalInfo.name personalInfo.title createdAt lastModified');

    res.json({
      success: true,
      resumes,
      searchQuery: q
    });

  } catch (error) {
    console.error('Search resumes error:', error);
    res.status(500).json({
      error: 'Server error while searching resumes'
    });
  }
});

module.exports = router;
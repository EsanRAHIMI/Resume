import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Edit3, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  X,
  ArrowLeft,
  Save
} from 'lucide-react';
import './App.css';
import { uploadResume, generatePDFFromPreview, authAPI, resumeAPI } from './services/api';
import ResumePreview from './components/ResumePreview';
import Login from './components/Login';
import Register from './components/Register';
import ResumeDashboard from './components/ResumeDashboard';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // App state
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, upload, edit, preview
  const [resumeData, setResumeData] = useState(null);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeDescription, setResumeDescription] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // saved, saving, error

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.authenticated) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setResumeData(null);
    setCurrentResumeId(null);
    setError('');
  };

  const handleCreateNew = () => {
    setCurrentView('upload');
    setResumeData(null);
    setCurrentResumeId(null);
    setResumeTitle('');
    setResumeDescription('');
    setActiveTab('upload');
  };

  const handleEditResume = async (resume) => {
    try {
      setLoading(true);
      setLoadingMessage('Loading resume...');
      
      const response = await resumeAPI.getResume(resume._id);
      setResumeData(response.resume);
      setCurrentResumeId(resume._id);
      setResumeTitle(resume.title);
      setResumeDescription(resume.description || '');
      setCurrentView('edit');
      setActiveTab('edit');
    } catch (error) {
      setError('Failed to load resume. Please try again.');
      console.error('Load resume error:', error);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setResumeData(null);
    setCurrentResumeId(null);
    setError('');
  };

  // Enhanced file upload handler
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid file type (PDF, DOCX, DOC, or TXT)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    
    setIsProcessing(true);
    setLoading(true);
    setUploadProgress(0);
    setError('');
    
    try {
      setProcessingStep('Uploading your resume...');
      setLoadingMessage('Uploading your resume...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setUploadProgress(25);
      
      setProcessingStep('Analyzing document structure...');
      setLoadingMessage('Analyzing document structure...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      setUploadProgress(50);
      
      setProcessingStep('Extracting information with AI...');
      setLoadingMessage('Extracting information with AI...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadProgress(75);
      
      setProcessingStep('Structuring your data...');
      setLoadingMessage('Structuring your data...');
      
      const result = await uploadResume(file);
      setUploadProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResumeData(result.data);
      setUploadSuccess(true);
      setActiveTab('edit');
      
      setTimeout(() => {
        setUploadSuccess(false);
        setIsProcessing(false);
        setSelectedFile(null);
      }, 1200);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading file: ' + error.message);
      setIsProcessing(false);
      setSelectedFile(null);
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setUploadProgress(0);
      setProcessingStep('');
    }
  }, []);

  // Save resume function
  const saveResume = useCallback(async () => {
    if (!resumeData || !resumeTitle.trim()) {
      setError('Please provide a resume title');
      return;
    }

    try {
      setSaveStatus('saving');
      
      const resumePayload = {
        title: resumeTitle.trim(),
        description: resumeDescription.trim(),
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        certifications: resumeData.certifications,
        languages: resumeData.languages,
        projects: resumeData.projects
      };

      if (currentResumeId) {
        await resumeAPI.updateResume(currentResumeId, resumePayload);
      } else {
        const response = await resumeAPI.createResume(resumePayload);
        setCurrentResumeId(response.resume._id);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save resume. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [resumeData, resumeTitle, resumeDescription, currentResumeId]);

  // Auto-save effect
  useEffect(() => {
    if (resumeData && resumeTitle.trim() && currentView === 'edit') {
      const autoSaveTimer = setTimeout(() => {
        saveResume();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [resumeData, resumeTitle, saveResume, currentView]);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Resume data modification handlers
  const handleInputChange = useCallback((section, field, value, index = null) => {
    setResumeData(prev => {
      const newData = { ...prev };
      if (index !== null) {
        if (!newData[section]) newData[section] = [];
        if (!newData[section][index]) newData[section][index] = {};
        newData[section][index][field] = value;
      } else {
        if (!newData[section]) newData[section] = {};
        newData[section][field] = value;
      }
      return newData;
    });
  }, []);

  const addExperience = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), { 
        company: '', 
        position: '', 
        duration: '', 
        description: '' 
      }]
    }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), { 
        institution: '', 
        degree: '', 
        duration: '', 
        gpa: '' 
      }]
    }));
  }, []);

  const removeExperience = useCallback((index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  }, []);

  const removeEducation = useCallback((index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }, []);

  // PDF generation handler
  const generatePDFDownload = useCallback(async () => {
    if (!resumeData) {
      setError('No resume data available to generate PDF');
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage('Generating PDF from Live Preview...');
      
      const filename = `${resumeData.personalInfo?.name || resumeTitle || 'Resume'}.pdf`;
      await generatePDFFromPreview('resume-preview-for-pdf', filename);
      setLoadingMessage('PDF generated successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Error generating PDF: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [resumeData, resumeTitle]);

  // Tab change handler
  const handleTabChange = useCallback((tab) => {
    if ((tab === 'edit' || tab === 'preview') && !resumeData) {
      setError('Please upload a resume first');
      return;
    }
    setActiveTab(tab);
  }, [resumeData]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Prevent default drag behaviors
  useEffect(() => {
    if (currentView !== 'upload') return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDocumentDrop = (e) => {
      preventDefaults(e);
      if (activeTab === 'upload') {
        handleDrop(e);
      }
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, preventDefaults, false);
    });

    document.addEventListener('drop', handleDocumentDrop, false);

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.removeEventListener(eventName, preventDefaults, false);
      });
      document.removeEventListener('drop', handleDocumentDrop, false);
    };
  }, [currentView, activeTab, handleDrop]);

  // Show loading spinner during auth check
  if (authLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Resume Builder...</div>
      </div>
    );
  }

  // Show authentication screens
  if (!isAuthenticated) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Show dashboard
  if (currentView === 'dashboard') {
    return (
      <ResumeDashboard
        user={user}
        onCreateNew={handleCreateNew}
        onEditResume={handleEditResume}
        onLogout={handleLogout}
      />
    );
  }

  // Show main app interface
  return (
    <div className="app">
      {/* Error notification */}
      {error && (
        <div className="error-notification">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleBackToDashboard}
              className="back-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>
                <FileText className="icon" /> 
                Resume Builder Pro
              </h1>
              <p>Transform your resume into a professional masterpiece</p>
            </div>
          </div>
          
          {resumeData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={saveResume}
                disabled={!resumeTitle.trim() || saveStatus === 'saving'}
                style={{
                  background: saveStatus === 'saved' ? '#27ae60' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: !resumeTitle.trim() ? 0.6 : 1
                }}
              >
                {saveStatus === 'saving' ? (
                  <div className="loading-spinner small"></div>
                ) : saveStatus === 'saved' ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      {currentView !== 'dashboard' && (
        <nav className="tab-nav">
          <div className="container">
            <button 
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabChange('upload')}
            >
              <Upload className="icon" /> Upload Resume
            </button>
            <button 
              className={`tab ${activeTab === 'edit' ? 'active' : ''} ${!resumeData ? 'disabled' : ''}`}
              onClick={() => handleTabChange('edit')}
              disabled={!resumeData}
            >
              <Edit3 className="icon" /> Edit & Customize
            </button>
            <button 
              className={`tab ${activeTab === 'preview' ? 'active' : ''} ${!resumeData ? 'disabled' : ''}`}
              onClick={() => handleTabChange('preview')}
              disabled={!resumeData}
            >
              <FileText className="icon" /> Preview & Download
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="upload-section">
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadSuccess ? 'upload-success' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {isProcessing && (
                  <div className="processing-overlay">
                    <div className="processing-spinner"></div>
                    <div className="processing-text">{processingStep}</div>
                    <div className="processing-subtext">Please wait while we process your resume</div>
                  </div>
                )}
                
                {uploadSuccess ? (
                  <CheckCircle className="upload-icon" style={{ color: '#27ae60' }} />
                ) : (
                  <Upload className="upload-icon" />
                )}
                
                <h3>
                  {uploadSuccess ? 'Resume Uploaded Successfully!' : 'Drop your resume here or click to browse'}
                </h3>
                <p>
                  {uploadSuccess 
                    ? 'Your resume has been processed and is ready for editing!' 
                    : 'We support PDF, DOCX, DOC, and TXT files up to 5MB'
                  }
                </p>
                
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="file-input"
                  disabled={isProcessing}
                />
                <label htmlFor="file-input" className="upload-btn">
                  {isProcessing ? 'Processing...' : uploadSuccess ? 'Upload Another Resume' : 'Choose File'}
                </label>
                
                <div className="file-types">
                  <span className="file-type">PDF</span>
                  <span className="file-type">DOCX</span>
                  <span className="file-type">DOC</span>
                  <span className="file-type">TXT</span>
                </div>
              </div>
              
              {selectedFile && !isProcessing && !uploadSuccess && (
                <div className="file-preview">
                  <div className="file-info">
                    <div className="file-icon">
                      {selectedFile.name.split('.').pop().toUpperCase()}
                    </div>
                    <div className="file-details">
                      <h4>{selectedFile.name}</h4>
                      <div className="file-size">{selectedFile.size}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && resumeData && (
            <div className="edit-section">
              {/* Resume Title and Description */}
              <div className="section">
                <h3><FileText className="icon" /> Resume Details</h3>
                <div className="form-row">
                  <div className="form-group floating">
                    <input 
                      type="text" 
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      placeholder=" "
                      id="resume-title"
                    />
                    <label htmlFor="resume-title">Resume Title (e.g., "Software Engineer - Google")</label>
                  </div>
                  <div className="form-group floating">
                    <input 
                      type="text" 
                      value={resumeDescription}
                      onChange={(e) => setResumeDescription(e.target.value)}
                      placeholder=" "
                      id="resume-description"
                    />
                    <label htmlFor="resume-description">Description (Optional)</label>
                  </div>
                </div>
              </div>

              <div className="edit-grid">
                {/* Edit Panel */}
                <div className="edit-panel">
                  {/* Personal Information */}
                  <div className="section">
                    <h3><User className="icon" /> Personal Information</h3>
                    <div className="form-group floating">
                      <input 
                        type="text" 
                        value={resumeData.personalInfo?.name || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                        placeholder=" "
                        id="name"
                      />
                      <label htmlFor="name">Full Name</label>
                    </div>
                    <div className="form-group floating">
                      <input 
                        type="text" 
                        value={resumeData.personalInfo?.title || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'title', e.target.value)}
                        placeholder=" "
                        id="title"
                      />
                      <label htmlFor="title">Professional Title</label>
                    </div>
                    <div className="form-row">
                      <div className="form-group floating">
                        <input 
                          type="email" 
                          value={resumeData.personalInfo?.email || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                          placeholder=" "
                          id="email"
                        />
                        <label htmlFor="email">Email Address</label>
                      </div>
                      <div className="form-group floating">
                        <input 
                          type="tel" 
                          value={resumeData.personalInfo?.phone || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                          placeholder=" "
                          id="phone"
                        />
                        <label htmlFor="phone">Phone Number</label>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group floating">
                        <input 
                          type="text" 
                          value={resumeData.personalInfo?.location || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                          placeholder=" "
                          id="location"
                        />
                        <label htmlFor="location">Location</label>
                      </div>
                      <div className="form-group floating">
                        <input 
                          type="url" 
                          value={resumeData.personalInfo?.website || ''}
                          onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                          placeholder=" "
                          id="website"
                        />
                        <label htmlFor="website">Website/Portfolio</label>
                      </div>
                    </div>
                    <div className="form-group floating">
                      <textarea 
                        rows="4"
                        value={resumeData.personalInfo?.summary || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        placeholder=" "
                        id="summary"
                      />
                      <label htmlFor="summary">Professional Summary</label>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="section">
                    <h3><Briefcase className="icon" /> Work Experience</h3>
                    {(resumeData.experience || []).map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="item-header">
                          <h4>Experience #{index + 1}</h4>
                          <button 
                            className="remove-btn"
                            onClick={() => removeExperience(index)}
                            type="button"
                            title="Remove Experience"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="form-row">
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={exp.company || ''}
                              onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                              placeholder=" "
                              id={`company-${index}`}
                            />
                            <label htmlFor={`company-${index}`}>Company Name</label>
                          </div>
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={exp.position || ''}
                              onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                              placeholder=" "
                              id={`position-${index}`}
                            />
                            <label htmlFor={`position-${index}`}>Job Title</label>
                          </div>
                        </div>
                        <div className="form-group floating">
                          <input 
                            type="text" 
                            value={exp.duration || ''}
                            onChange={(e) => handleInputChange('experience', 'duration', e.target.value, index)}
                            placeholder=" "
                            id={`duration-${index}`}
                          />
                          <label htmlFor={`duration-${index}`}>Duration (e.g., Jan 2020 - Present)</label>
                        </div>
                        <div className="form-group floating">
                          <textarea 
                            rows="4"
                            value={exp.description || ''}
                            onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                            placeholder=" "
                            id={`description-${index}`}
                          />
                          <label htmlFor={`description-${index}`}>Job Description & Achievements</label>
                        </div>
                      </div>
                    ))}
                    <button className="add-btn" onClick={addExperience} type="button">
                      <Plus size={20} /> Add Work Experience
                    </button>
                  </div>

                  {/* Education */}
                  <div className="section">
                    <h3><GraduationCap className="icon" /> Education</h3>
                    {(resumeData.education || []).map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="item-header">
                          <h4>Education #{index + 1}</h4>
                          <button 
                            className="remove-btn"
                            onClick={() => removeEducation(index)}
                            type="button"
                            title="Remove Education"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="form-row">
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={edu.institution || ''}
                              onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                              placeholder=" "
                              id={`institution-${index}`}
                            />
                            <label htmlFor={`institution-${index}`}>Institution Name</label>
                          </div>
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={edu.degree || ''}
                              onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                              placeholder=" "
                              id={`degree-${index}`}
                            />
                            <label htmlFor={`degree-${index}`}>Degree & Field of Study</label>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={edu.duration || ''}
                              onChange={(e) => handleInputChange('education', 'duration', e.target.value, index)}
                              placeholder=" "
                              id={`edu-duration-${index}`}
                            />
                            <label htmlFor={`edu-duration-${index}`}>Duration</label>
                          </div>
                          <div className="form-group floating">
                            <input 
                              type="text" 
                              value={edu.gpa || ''}
                              onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
                              placeholder=" "
                              id={`gpa-${index}`}
                            />
                            <label htmlFor={`gpa-${index}`}>GPA (Optional)</label>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="add-btn" onClick={addEducation} type="button">
                      <Plus size={20} /> Add Education
                    </button>
                  </div>

                  {/* Skills */}
                  <div className="section">
                    <h3><Code className="icon" /> Skills & Technologies</h3>
                    <div className="form-group floating">
                      <textarea 
                        rows="4"
                        value={resumeData.skills?.join(', ') || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        placeholder=" "
                        id="skills"
                      />
                      <label htmlFor="skills">Skills (comma-separated)</label>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="section">
                    <h3><Award className="icon" /> Certifications & Awards</h3>
                    <div className="form-group floating">
                      <textarea 
                        rows="3"
                        value={resumeData.certifications?.join(', ') || ''}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          certifications: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        placeholder=" "
                        id="certifications"
                      />
                      <label htmlFor="certifications">Certifications (comma-separated)</label>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="section">
                    <h3><Globe className="icon" /> Languages</h3>
                    <div className="form-group floating">
                      <textarea 
                        rows="2"
                        value={resumeData.languages?.join(', ') || 'English'}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          languages: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        placeholder=" "
                        id="languages"
                      />
                      <label htmlFor="languages">Languages (comma-separated)</label>
                    </div>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="preview-panel">
                  <h3>Live Preview</h3>
                  <div className="live-preview-container">
                    <div id="resume-preview-for-pdf">
                      <ResumePreview resumeData={resumeData} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="action-bar">
                <button 
                  className="download-btn" 
                  onClick={generatePDFDownload}
                  disabled={loading}
                >
                  <Download className="icon" /> 
                  {loading ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && resumeData && (
            <div className="preview-section">
              <div className="preview-container">
                <div id="resume-preview-for-pdf-standalone">
                  <ResumePreview resumeData={resumeData} />
                </div>
              </div>
              <div className="action-bar">
                <button 
                  className="download-btn" 
                  onClick={generatePDFDownload}
                  disabled={loading}
                >
                  <Download className="icon" /> 
                  {loading ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">{loadingMessage || 'Processing...'}</div>
          <div className="loading-subtext">Please wait while we process your request</div>
          
          {uploadProgress > 0 && (
            <>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
              
              <div className="processing-steps">
                <div className={`step-indicator ${uploadProgress >= 25 ? 'completed' : uploadProgress > 0 ? 'active' : ''}`}></div>
                <div className={`step-indicator ${uploadProgress >= 50 ? 'completed' : uploadProgress >= 25 ? 'active' : ''}`}></div>
                <div className={`step-indicator ${uploadProgress >= 75 ? 'completed' : uploadProgress >= 50 ? 'active' : ''}`}></div>
                <div className={`step-indicator ${uploadProgress >= 100 ? 'completed' : uploadProgress >= 75 ? 'active' : ''}`}></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
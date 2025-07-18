import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Download,
  Calendar,
  User,
  Building2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { resumeAPI, authAPI, generatePDFFromPreview } from '../services/api';

const ResumeDashboard = ({ user, onCreateNew, onEditResume, onLogout }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumes();
      setResumes(response.resumes);
    } catch (error) {
      setError('Failed to load resumes. Please try again.');
      console.error('Load resumes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadResumes();
      return;
    }

    try {
      const response = await resumeAPI.searchResumes(query);
      setResumes(response.resumes);
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Search error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      setDeleting(id);
      await resumeAPI.deleteResume(id);
      setResumes(resumes.filter(resume => resume._id !== id));
    } catch (error) {
      setError('Failed to delete resume. Please try again.');
      console.error('Delete error:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      setDuplicating(id);
      const response = await resumeAPI.duplicateResume(id);
      setResumes([response.resume, ...resumes]);
    } catch (error) {
      setError('Failed to duplicate resume. Please try again.');
      console.error('Duplicate error:', error);
    } finally {
      setDuplicating(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h1>Welcome back, {user.name}!</h1>
              <p>Manage your professional resumes</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-notification dashboard-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search resumes by title, company, or position..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={onCreateNew} className="create-btn">
          <Plus size={18} />
          Create New Resume
        </button>
      </div>

      {/* Resumes Grid */}
      <div className="resumes-container">
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="resume-card skeleton">
                <div className="skeleton-header"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>No resumes found</h3>
            <p>
              {searchQuery 
                ? `No resumes match "${searchQuery}". Try a different search term.`
                : "You haven't created any resumes yet. Create your first professional resume!"
              }
            </p>
            <button onClick={onCreateNew} className="create-btn">
              <Plus size={18} />
              Create Your First Resume
            </button>
          </div>
        ) : (
          <div className="resumes-grid">
            {resumes.map((resume) => (
              <div key={resume._id} className="resume-card">
                <div className="resume-card-header">
                  <div className="resume-icon">
                    <FileText size={24} />
                  </div>
                  <div className="resume-info">
                    <h3 className="resume-title">{resume.title}</h3>
                    {resume.description && (
                      <p className="resume-description">{resume.description}</p>
                    )}
                  </div>
                </div>

                <div className="resume-meta">
                  {resume.personalInfo?.name && (
                    <div className="meta-item">
                      <User size={14} />
                      <span>{resume.personalInfo.name}</span>
                    </div>
                  )}
                  {resume.personalInfo?.title && (
                    <div className="meta-item">
                      <Building2 size={14} />
                      <span>{resume.personalInfo.title}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Modified {formatDate(resume.lastModified)}</span>
                  </div>
                </div>

                <div className="resume-actions">
                  <button
                    onClick={() => onEditResume(resume)}
                    className="action-btn primary"
                    title="Edit Resume"
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicate(resume._id)}
                    className="action-btn secondary"
                    disabled={duplicating === resume._id}
                    title="Duplicate Resume"
                  >
                    {duplicating === resume._id ? (
                      <div className="loading-spinner tiny"></div>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="action-btn danger"
                    disabled={deleting === resume._id}
                    title="Delete Resume"
                  >
                    {deleting === resume._id ? (
                      <div className="loading-spinner tiny"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDashboard;
import React, { useState, useCallback } from 'react';
import { Upload, Trash2, User, Eye, EyeOff } from 'lucide-react';
import { photoAPI } from '../services/api';

const PhotoUpload = ({ 
  currentPhoto, 
  showPhoto = true, 
  onPhotoUpdate, 
  onShowPhotoToggle 
}) => {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await photoAPI.uploadPhoto(file);
      onPhotoUpdate(result.photo);
    } catch (error) {
      console.error('Photo upload error:', error);
      setError('Failed to upload photo: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [onPhotoUpdate]);

  const handlePhotoRemove = useCallback(async () => {
    if (!currentPhoto?.filename) return;

    if (!window.confirm('Are you sure you want to remove this photo?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await photoAPI.deletePhoto(currentPhoto.filename);
      onPhotoUpdate(null);
    } catch (error) {
      console.error('Photo delete error:', error);
      setError('Failed to remove photo: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [currentPhoto, onPhotoUpdate]);

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

  const photoUrl = currentPhoto?.filename ? photoAPI.getPhotoUrl(currentPhoto.filename) : null;

  return (
    <div className="photo-upload-section">
      <h4 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        color: '#2c3e50',
        fontSize: '1rem',
        fontWeight: '600'
      }}>
        <User size={18} />
        Profile Photo
      </h4>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div className="photo-upload-container">
        {/* Photo Display Toggle */}
        <div className="photo-display-toggle">
          <input
            type="checkbox"
            id="showPhoto"
            checked={showPhoto}
            onChange={(e) => onShowPhotoToggle(e.target.checked)}
          />
          <label htmlFor="showPhoto">
            {showPhoto ? (
              <>
                <Eye size={16} style={{ marginRight: '0.5rem' }} />
                Show photo in resume
              </>
            ) : (
              <>
                <EyeOff size={16} style={{ marginRight: '0.5rem' }} />
                Hide photo in resume
              </>
            )}
          </label>
        </div>

        {/* Photo Preview */}
        {currentPhoto && (
          <div className="photo-preview">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Profile" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="photo-placeholder">
                <User size={40} />
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div 
          className={`photo-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('photo-input').click()}
        >
          <Upload size={32} color="#667eea" style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
            {currentPhoto ? 'Change Photo' : 'Upload Profile Photo'}
          </p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#999' }}>
            Drag & drop or click to browse (JPEG, PNG, GIF, WebP - Max 5MB)
          </p>
          
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </div>

        {/* Photo Controls */}
        {currentPhoto && (
          <div className="photo-controls">
            <button
              type="button"
              onClick={() => document.getElementById('photo-input').click()}
              disabled={loading}
              className="upload-btn"
            >
              <Upload size={14} style={{ marginRight: '0.25rem' }} />
              Change Photo
            </button>
            <button
              type="button"
              onClick={handlePhotoRemove}
              disabled={loading}
              className="remove-btn"
            >
              <Trash2 size={14} style={{ marginRight: '0.25rem' }} />
              Remove Photo
            </button>
          </div>
        )}

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            color: '#667eea',
            fontSize: '0.9rem'
          }}>
            Processing photo...
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
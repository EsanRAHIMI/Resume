import React, { useState, useCallback } from 'react';
import { Upload, Trash2, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setTimeout(clearMessages, 5000);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(clearMessages, 5000);
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      console.log('📸 Uploading photo:', file.name, file.size, file.type);
      const result = await photoAPI.uploadPhoto(file);
      console.log('📸 Upload result:', result);
      
      onPhotoUpdate(result.photo);
      setSuccess('Photo uploaded successfully!');
      setTimeout(clearMessages, 3000);
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      setError('Failed to upload photo: ' + (error.response?.data?.message || error.message));
      setTimeout(clearMessages, 5000);
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
    clearMessages();

    try {
      await photoAPI.deletePhoto(currentPhoto.filename);
      onPhotoUpdate(null);
      setSuccess('Photo removed successfully!');
      setTimeout(clearMessages, 3000);
    } catch (error) {
      console.error('❌ Photo delete error:', error);
      setError('Failed to remove photo: ' + (error.response?.data?.message || error.message));
      setTimeout(clearMessages, 5000);
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

      {/* Success Message */}
      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
          border: '1px solid #c3e6cb',
          color: '#155724',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="photo-upload-container">
        {/* Photo Display Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          marginBottom: '1rem'
        }}>
          <input
            type="checkbox"
            id="showPhoto"
            checked={showPhoto}
            onChange={(e) => onShowPhotoToggle(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <label 
            htmlFor="showPhoto"
            style={{
              fontWeight: '600',
              color: '#2c3e50',
              cursor: 'pointer',
              margin: '0',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {showPhoto ? <Eye size={16} /> : <EyeOff size={16} />}
            {showPhoto ? 'Show photo in resume' : 'Hide photo in resume'}
          </label>
        </div>

        {/* SIMPLIFIED Photo Preview */}
        {currentPhoto && photoUrl && (
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto',
              border: '3px solid #667eea',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={photoUrl}
                alt="Profile Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onLoad={() => console.log('✅ Photo displayed successfully')}
                onError={(e) => console.error('❌ Photo display error:', e)}
              />
            </div>
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Current Photo
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div 
          className={`photo-upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && document.getElementById('photo-input').click()}
          style={{ 
            cursor: loading ? 'not-allowed' : 'pointer',
            border: '2px dashed #e9ecef',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            background: dragActive ? 'rgba(102, 126, 234, 0.1)' : '#fafafa',
            borderColor: dragActive ? '#667eea' : '#e9ecef',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              color: '#667eea'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '50%',
                borderTopColor: '#667eea',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Processing photo...</p>
            </div>
          ) : (
            <>
              <Upload size={32} color="#667eea" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontWeight: '600' }}>
                {currentPhoto ? 'Change Photo' : 'Upload Profile Photo'}
              </p>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#999' }}>
                Drag & drop or click to browse
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                (JPEG, PNG, GIF, WebP - Max 5MB)
              </p>
            </>
          )}
          
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
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={() => document.getElementById('photo-input').click()}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                background: '#667eea',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              <Upload size={14} />
              Change Photo
            </button>
            <button
              type="button"
              onClick={handlePhotoRemove}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                background: '#dc3545',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              <Trash2 size={14} />
              Remove Photo
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PhotoUpload;
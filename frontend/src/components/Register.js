// /frontend/src/components/Register.js
import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });
      onRegister(response.user);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return 'strong';
    return 'medium';
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus className="auth-icon" />
          <h2>Create Account</h2>
          <p>Join Resume Builder Pro and create professional resumes</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordStrength && (
              <div className={`password-strength ${passwordStrength}`}>
                <div className="strength-indicator">
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                </div>
                <span className="strength-text">
                  {passwordStrength === 'weak' && 'Weak password'}
                  {passwordStrength === 'medium' && 'Medium strength'}
                  {passwordStrength === 'strong' && 'Strong password'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {formData.confirmPassword && (
                <div className="password-match">
                  {formData.password === formData.confirmPassword ? (
                    <CheckCircle size={16} className="match-icon success" />
                  ) : (
                    <AlertCircle size={16} className="match-icon error" />
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner small"></div>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-link"
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => localStorage.getItem('resumeBuilderToken');
const setToken = (token) => localStorage.setItem('resumeBuilderToken', token);
const removeToken = () => localStorage.removeItem('resumeBuilderToken');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================================
// AUTHENTICATION FUNCTIONS
// ================================

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      removeToken();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  }
};

// ================================
// RESUME MANAGEMENT FUNCTIONS
// ================================

export const resumeAPI = {
  // Get all resumes for current user
  getResumes: async (page = 1, limit = 10) => {
    const response = await api.get(`/resume?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get specific resume
  getResume: async (id) => {
    const response = await api.get(`/resume/${id}`);
    return response.data;
  },

  // Create new resume
  createResume: async (resumeData) => {
    const response = await api.post('/resume', resumeData);
    return response.data;
  },

  // Update resume
  updateResume: async (id, resumeData) => {
    const response = await api.put(`/resume/${id}`, resumeData);
    return response.data;
  },

  // Delete resume
  deleteResume: async (id) => {
    const response = await api.delete(`/resume/${id}`);
    return response.data;
  },

  // Duplicate resume
  duplicateResume: async (id) => {
    const response = await api.post(`/resume/${id}/duplicate`);
    return response.data;
  },

  // Search resumes
  searchResumes: async (query) => {
    const response = await api.get(`/resume/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// ================================
// FILE UPLOAD FUNCTIONS
// ================================

export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ================================
// PDF GENERATION FUNCTIONS
// ================================

// Generate PDF from Live Preview
export const generatePDFFromPreview = async (previewElementId, filename = 'resume.pdf') => {
  try {
    // Get the preview element
    const element = document.getElementById(previewElementId);
    if (!element) {
      throw new Error('Preview element not found');
    }

    // Create a clone for PDF generation with better styling
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.transform = 'scale(1)';
    clone.style.width = '210mm';
    clone.style.height = 'auto';
    clone.style.backgroundColor = 'white';
    
    // Add clone to document temporarily
    document.body.appendChild(clone);

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate canvas from the cloned element
    const canvas = await html2canvas(clone, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0
    });

    // Remove the clone
    document.body.removeChild(clone);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download the PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

// ================================
// UTILITY FUNCTIONS
// ================================

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthToken = getToken;
export const setAuthToken = setToken;
export const clearAuthToken = removeToken;

// Backward compatibility exports
export const generatePDF = generatePDFFromPreview;
export const saveResume = resumeAPI.createResume;
export const getResumes = resumeAPI.getResumes;
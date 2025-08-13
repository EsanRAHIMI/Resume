import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5001';

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
// PHOTO UPLOAD FUNCTIONS - CLEAN VERSION
// ================================

export const photoAPI = {
  uploadPhoto: async (file) => {
    try {
      console.log('📸 Starting photo upload:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/upload/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('📸 Photo upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('آپلود عکس به دلیل اتمام زمان با مشکل مواجه شد. لطفا دوباره تلاش کنید.');
      }
      throw error;
    }
  },

  deletePhoto: async (filename) => {
    try {
      console.log('🗑️ Deleting photo:', filename);
      const response = await api.delete(`/upload/photo/${filename}`);
      console.log('🗑️ Photo delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Photo delete error:', error);
      throw error;
    }
  },

  // ✅ بهبود یافته: dynamic URL generation
  getPhotoUrl: (filename) => {
    if (!filename) {
      console.log('📸 No filename provided for photo URL');
      return null;
    }
    
    // چندین URL امتحان می‌کنیم
    const possibleUrls = [
      `${BASE_URL}/uploads/photos/${filename}`,
      `http://localhost:5001/uploads/photos/${filename}`,
      `http://127.0.0.1:5001/uploads/photos/${filename}`
    ];
    
    const photoUrl = possibleUrls[0]; // اولی را به عنوان پیش‌فرض انتخاب می‌کنیم
    console.log('📸 Generated photo URL:', photoUrl);
    console.log('📸 All possible URLs:', possibleUrls);
    
    return photoUrl;
  },

  // ✅ تست کردن دسترسی به URL عکس
  testPhotoUrl: async (url) => {
    try {
      console.log('📸 Testing photo URL:', url);
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      console.log('📸 Photo URL test result:', url, 'Status:', response.status, 'OK:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('📸 Photo URL test failed:', url, error);
      return false;
    }
  },

  // ✅ تست چندگانه URL ها
  findWorkingPhotoUrl: async (filename) => {
    if (!filename) return null;
    
    const possibleUrls = [
      `${BASE_URL}/uploads/photos/${filename}`,
      `http://localhost:5001/uploads/photos/${filename}`,
      `http://127.0.0.1:5001/uploads/photos/${filename}`
    ];
    
    for (const url of possibleUrls) {
      const isWorking = await photoAPI.testPhotoUrl(url);
      if (isWorking) {
        console.log('✅ Working photo URL found:', url);
        return url;
      }
    }
    
    console.log('❌ No working photo URL found for:', filename);
    return null;
  },

  // ✅ بررسی وضعیت سرور
  checkPhotoServerStatus: async () => {
    try {
      const response = await fetch(`${BASE_URL}/test-photos`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await response.json();
      console.log('📸 Photo server status:', data);
      return data;
    } catch (error) {
      console.error('❌ Photo server status check failed:', error);
      return null;
    }
  }
};

// ================================
// RESUME MANAGEMENT FUNCTIONS
// ================================

export const resumeAPI = {
  getResumes: async (page = 1, limit = 10) => {
    const response = await api.get(`/resume?page=${page}&limit=${limit}`);
    return response.data;
  },

  getResume: async (id) => {
    const response = await api.get(`/resume/${id}`);
    return response.data;
  },

  createResume: async (resumeData) => {
    const response = await api.post('/resume', resumeData);
    return response.data;
  },

  updateResume: async (id, resumeData) => {
    const response = await api.put(`/resume/${id}`, resumeData);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resume/${id}`);
    return response.data;
  },

  duplicateResume: async (id) => {
    const response = await api.post(`/resume/${id}/duplicate`);
    return response.data;
  },

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

export const generatePDFFromPreview = async (previewElementId, filename = 'resume.pdf') => {
  try {
    const element = document.getElementById(previewElementId);
    if (!element) {
      throw new Error('Preview element not found');
    }

    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.transform = 'scale(1)';
    clone.style.width = '210mm';
    clone.style.height = 'auto';
    clone.style.backgroundColor = 'white';
    
    document.body.appendChild(clone);
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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

export const generatePDF = generatePDFFromPreview;
export const saveResume = resumeAPI.createResume;
export const getResumes = resumeAPI.getResumes;
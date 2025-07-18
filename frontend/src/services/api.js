import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload resume');
    }

    return response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// New function: Generate PDF from Live Preview
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

// Backup function: Server-side PDF generation (fallback)
export const generatePDF = async (resumeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate PDF');
    }

    return response.blob();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export const saveResume = async (resumeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save resume');
    }

    return response.json();
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};

export const getResumes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resume/list`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch resumes');
    }

    return response.json();
  } catch (error) {
    console.error('Fetch resumes error:', error);
    throw error;
  }
};
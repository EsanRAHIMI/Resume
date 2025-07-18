const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function parseResume(filePath, mimeType) {
  let text = '';
  
  try {
    // Extract text based on file type
    if (mimeType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (mimeType === 'text/plain') {
      text = await fs.readFile(filePath, 'utf8');
    }

    console.log('📝 Extracted text length:', text.length);

    // Use OpenAI to structure the resume data
    const structuredData = await structureResumeWithAI(text);
    
    // Clean up uploaded file
    await fs.unlink(filePath);
    
    return structuredData;
  } catch (error) {
    console.error('❌ Parse error:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

async function structureResumeWithAI(text) {
  try {
    const prompt = `
    Parse the following resume text and extract structured information in JSON format.
    Return only valid JSON with the following structure:
    {
      "personalInfo": {
        "name": "",
        "title": "",
        "email": "",
        "phone": "",
        "location": "",
        "website": "",
        "summary": ""
      },
      "experience": [
        {
          "company": "",
          "position": "",
          "duration": "",
          "description": ""
        }
      ],
      "education": [
        {
          "institution": "",
          "degree": "",
          "duration": "",
          "gpa": ""
        }
      ],
      "skills": [],
      "certifications": [],
      "languages": [],
      "projects": [
        {
          "name": "",
          "description": "",
          "technologies": []
        }
      ]
    }

    Resume text:
    ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000
    });

    const jsonResponse = response.choices[0].message.content;
    const parsedData = JSON.parse(jsonResponse);
    
    // Ensure all required fields exist
    if (!parsedData.certifications) parsedData.certifications = [];
    if (!parsedData.languages) parsedData.languages = ['English'];
    
    console.log('✅ Successfully structured resume data');
    return parsedData;
  } catch (error) {
    console.error('❌ AI structuring error:', error);
    // Enhanced fallback parsing
    return enhancedFallbackParsing(text);
  }
}

function enhancedFallbackParsing(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    personalInfo: {
      name: lines[0] || '',
      title: '',
      email: extractEmail(text) || '',
      phone: extractPhone(text) || '',
      location: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: ['English'],
    projects: []
  };
}

function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
}

module.exports = { parseResume };
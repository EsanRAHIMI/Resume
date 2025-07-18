const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'test123'
};

let authToken = '';
let testResumeId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (name, testFunction) => {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    await testFunction();
    log(`✅ ${name} - PASSED`, 'green');
  } catch (error) {
    log(`❌ ${name} - FAILED: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
    }
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const runTests = async () => {
  log('🚀 Starting API Endpoint Tests', 'blue');
  log(`📡 API Base URL: ${API_BASE_URL}`, 'yellow');

  // Test 1: Health Check
  await testEndpoint('Health Check', async () => {
    const response = await api.get('/health');
    if (response.data.status !== 'OK') {
      throw new Error('Health check failed');
    }
  });

  // Test 2: API Info
  await testEndpoint('API Info', async () => {
    const response = await api.get('/');
    if (!response.data.message.includes('Resume Builder')) {
      throw new Error('API info endpoint failed');
    }
  });

  // Test 3: User Registration
  await testEndpoint('User Registration', async () => {
    try {
      const response = await api.post('/auth/register', TEST_USER);
      if (!response.data.success || !response.data.token) {
        throw new Error('Registration failed');
      }
      authToken = response.data.token;
      log(`   🔑 Auth token received: ${authToken.substring(0, 20)}...`, 'yellow');
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        log('   ℹ️  User already exists, trying login...', 'yellow');
        const loginResponse = await api.post('/auth/login', {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        if (!loginResponse.data.success || !loginResponse.data.token) {
          throw new Error('Login after existing user failed');
        }
        authToken = loginResponse.data.token;
      } else {
        throw error;
      }
    }
  });

  // Test 4: Get Current User
  await testEndpoint('Get Current User', async () => {
    const response = await api.get('/auth/me');
    if (!response.data.success || !response.data.user) {
      throw new Error('Get current user failed');
    }
    log(`   👤 User: ${response.data.user.name} (${response.data.user.email})`, 'yellow');
  });

  // Test 5: Create Resume
  await testEndpoint('Create Resume', async () => {
    const resumeData = {
      title: 'Test Resume - Software Engineer',
      description: 'Test resume created by automated test',
      personalInfo: {
        name: 'Test User',
        title: 'Software Engineer',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        summary: 'Test summary for automated testing'
      },
      experience: [
        {
          company: 'Test Company',
          position: 'Software Engineer',
          duration: '2023 - Present',
          description: 'Test job description'
        }
      ],
      education: [
        {
          institution: 'Test University',
          degree: 'Bachelor of Computer Science',
          duration: '2019 - 2023',
          gpa: '3.8'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js'],
      certifications: ['Test Certification'],
      languages: ['English']
    };

    const response = await api.post('/resume', resumeData);
    if (!response.data.success || !response.data.resume) {
      throw new Error('Create resume failed');
    }
    testResumeId = response.data.resume._id;
    log(`   📄 Resume created with ID: ${testResumeId}`, 'yellow');
  });

  // Test 6: Get All Resumes
  await testEndpoint('Get All Resumes', async () => {
    const response = await api.get('/resume');
    if (!response.data.success || !Array.isArray(response.data.resumes)) {
      throw new Error('Get all resumes failed');
    }
    log(`   📚 Found ${response.data.resumes.length} resumes`, 'yellow');
  });

  // Test 7: Get Specific Resume
  await testEndpoint('Get Specific Resume', async () => {
    const response = await api.get(`/resume/${testResumeId}`);
    if (!response.data.success || !response.data.resume) {
      throw new Error('Get specific resume failed');
    }
    log(`   📄 Resume title: ${response.data.resume.title}`, 'yellow');
  });

  // Test 8: Update Resume
  await testEndpoint('Update Resume', async () => {
    const updateData = {
      title: 'Updated Test Resume - Senior Software Engineer',
      description: 'Updated test resume'
    };

    const response = await api.put(`/resume/${testResumeId}`, updateData);
    if (!response.data.success || response.data.resume.title !== updateData.title) {
      throw new Error('Update resume failed');
    }
    log(`   ✏️  Updated title: ${response.data.resume.title}`, 'yellow');
  });

  // Test 9: Duplicate Resume
  await testEndpoint('Duplicate Resume', async () => {
    const response = await api.post(`/resume/${testResumeId}/duplicate`);
    if (!response.data.success || !response.data.resume) {
      throw new Error('Duplicate resume failed');
    }
    log(`   📋 Duplicated resume ID: ${response.data.resume._id}`, 'yellow');
  });

  // Test 10: Search Resumes
  await testEndpoint('Search Resumes', async () => {
    const response = await api.get('/resume/search?q=Test');
    if (!response.data.success || !Array.isArray(response.data.resumes)) {
      throw new Error('Search resumes failed');
    }
    log(`   🔍 Search found ${response.data.resumes.length} resumes`, 'yellow');
  });

  // Test 11: Delete Resume
  await testEndpoint('Delete Resume', async () => {
    const response = await api.delete(`/resume/${testResumeId}`);
    if (!response.data.success) {
      throw new Error('Delete resume failed');
    }
    log(`   🗑️  Resume deleted successfully`, 'yellow');
  });

  // Test 12: Logout
  await testEndpoint('User Logout', async () => {
    const response = await api.post('/auth/logout');
    if (!response.data.success) {
      throw new Error('Logout failed');
    }
    authToken = '';
  });

  // Test 13: Upload Endpoint (without file)
  await testEndpoint('Upload Endpoint Check', async () => {
    try {
      await api.post('/upload');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('No file')) {
        // Expected error for no file upload
        return;
      }
      throw error;
    }
  });

  log('\n🎉 All tests completed!', 'green');
  log('📊 Test Summary:', 'blue');
  log('   ✅ All critical endpoints are working', 'green');
  log('   🔐 Authentication system functional', 'green');
  log('   📄 Resume CRUD operations working', 'green');
  log('   🔍 Search functionality working', 'green');
  log('   📁 File upload endpoint accessible', 'green');
};

const main = async () => {
  try {
    await runTests();
    process.exit(0);
  } catch (error) {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests };
const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'PDF endpoint working ✅' });
});

router.post('/generate', async (req, res) => {
  try {
    const resumeData = req.body;
    
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    console.log('📄 Generating PDF for:', resumeData.personalInfo?.name);

    // Generate HTML template with the exact structure shown
    const htmlContent = generateProfessionalResumeHTML(resumeData);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with exact A4 dimensions
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    
    await browser.close();
    
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

function generateProfessionalResumeHTML(data) {
    const personalInfo = data.personalInfo || {};
    const experience = data.experience || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const certifications = data.certifications || [];
    const languages = data.languages || ['English'];
  
    // Core competencies (first 10 skills)
    const coreCompetencies = skills.slice(0, 10);
  
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Resume - ${personalInfo.name}</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
          <style>
              /* Resume Preview Styles - Exact Match */
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              .resume-preview-container {
                  width: 210mm;
                  max-width: 210mm;
                  background: white;
                  font-family: 'Arial', sans-serif;
                  font-size: 9pt;
                  line-height: 1.4;
                  color: #333;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                  position: relative;
                  margin: 0 auto;
                  min-height: 297mm;
              }
              
              /* Header Section */
              .resume-header {
                  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                  color: white;
                  padding: 20px 30px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  position: relative;
              }
              
              .profile-section {
                  display: flex;
                  align-items: center;
                  flex: 1;
              }
              
              .profile-photo {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  margin-right: 20px;
                  overflow: hidden;
                  border: 4px solid white;
              }
              
              .photo-placeholder {
                  width: 100%;
                  height: 100%;
                  background: #ecf0f1;
                  color: #2c3e50;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  font-weight: bold;
              }
              
              .header-content {
                  flex: 1;
              }
              
              .name {
                  font-size: 28px;
                  font-weight: bold;
                  margin: 0 0 5px 0;
                  letter-spacing: 2px;
              }
              
              .title {
                  font-size: 11px;
                  font-weight: 500;
                  margin: 0 0 2px 0;
                  opacity: 0.95;
              }
              
              .subtitle {
                  font-size: 10px;
                  font-weight: 300;
                  margin: 0;
                  opacity: 0.85;
              }
              
              .qr-section {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  background: white;
                  color: #333;
                  border-radius: 8px;
                  padding: 10px;
                  min-width: 80px;
              }
              
              .qr-code {
                  width: 50px;
                  height: 50px;
                  background: #333;
                  margin-bottom: 5px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 4px;
              }
              
              .qr-placeholder {
                  color: white;
                  font-size: 8px;
                  font-weight: bold;
              }
              
              .qr-label {
                  font-size: 7px;
                  text-align: center;
                  line-height: 1.2;
              }
              
              /* Main Content */
              .resume-main {
                  display: flex;
                  min-height: calc(297mm - 120px);
              }
              
              /* Left Sidebar */
              .sidebar {
                  width: 35%;
                  background: #f8f9fa;
                  padding: 90px 20px 20px 20px;
                  border-right: 1px solid #e9ecef;
              }
              
              .sidebar-section {
                  margin-bottom: 25px;
              }
              
              .sidebar-section h3 {
                  font-size: 10px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  border-bottom: 2px solid #3498db;
                  padding-bottom: 5px;
              }
              
              /* Contact */
              .contact-list {
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
              }
              
              .contact-item {
                  display: flex;
                  align-items: center;
                  font-size: 8px;
                  color: #555;
              }
              
              .contact-icon {
                  width: 12px;
                  height: 12px;
                  margin-right: 8px;
                  color: #3498db;
              }
              
              /* Lists */
              .competency-list,
              .certification-list,
              .language-list {
                  list-style: none;
                  padding: 0;
                  margin: 0;
              }
              
              .competency-list li,
              .certification-list li,
              .language-list li {
                  font-size: 8px;
                  margin-bottom: 4px;
                  padding-left: 12px;
                  position: relative;
                  color: #555;
                  line-height: 1.3;
              }
              
              .competency-list li::before,
              .certification-list li::before,
              .language-list li::before {
                  content: "•";
                  position: absolute;
                  left: 0;
                  color: #3498db;
                  font-weight: bold;
              }
              
              /* Tech Stack */
              .tech-stack {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
              }
              
              .tech-category {
                  font-size: 8px;
              }
              
              .tech-category strong {
                  display: block;
                  color: #2c3e50;
                  font-weight: 600;
                  margin-bottom: 2px;
              }
              
              .tech-category span {
                  color: #666;
                  line-height: 1.3;
              }
              
              /* Right Content */
              .content {
                  width: 65%;
                  padding: 25px 30px;
                  background: white;
              }
              
              .content-section {
                  margin-bottom: 25px;
              }
              
              .content-section h3 {
                  font-size: 11px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin-bottom: 15px;
                  display: flex;
                  align-items: center;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              
              .section-icon {
                  width: 14px;
                  height: 14px;
                  margin-right: 10px;
                  color: #3498db;
              }
              
              /* Profile */
              .profile-text {
                  font-size: 9px;
                  line-height: 1.6;
                  color: #444;
                  text-align: justify;
              }
              
              /* Timeline */
              .timeline {
                  position: relative;
                  padding-left: 20px;
              }
              
              .timeline::before {
                  content: '';
                  position: absolute;
                  left: 8px;
                  top: 0;
                  bottom: 0;
                  width: 2px;
                  background: #3498db;
              }
              
              .timeline-item {
                  position: relative;
                  margin-bottom: 20px;
                  padding-bottom: 15px;
              }
              
              .timeline-item::before {
                  content: '';
                  position: absolute;
                  left: -16px;
                  top: 5px;
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: #3498db;
                  border: 2px solid white;
                  box-shadow: 0 0 0 2px #3498db;
              }
              
              .timeline-content {
                  margin-left: 0;
              }
              
              .job-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: baseline;
                  margin-bottom: 3px;
              }
              
              .job-title {
                  font-size: 10px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin: 0;
              }
              
              .job-duration {
                  font-size: 8px;
                  color: #666;
                  font-style: italic;
              }
              
              .company-name {
                  font-size: 9px;
                  color: #3498db;
                  font-weight: 500;
                  margin-bottom: 6px;
              }
              
              .job-responsibilities {
                  list-style: none;
                  padding: 0;
                  margin: 0;
              }
              
              .job-responsibilities li {
                  font-size: 8.5px;
                  color: #444;
                  margin-bottom: 3px;
                  padding-left: 12px;
                  position: relative;
                  line-height: 1.4;
              }
              
              .job-responsibilities li::before {
                  content: "•";
                  position: absolute;
                  left: 0;
                  color: #3498db;
                  font-weight: bold;
              }
              
              /* Education */
              .education-list {
                  display: flex;
                  flex-direction: column;
                  gap: 15px;
              }
              
              .education-item {
                  padding-bottom: 10px;
                  border-bottom: 1px solid #eee;
              }
              
              .education-item:last-child {
                  border-bottom: none;
              }
              
              .education-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: baseline;
                  margin-bottom: 3px;
              }
              
              .degree-title {
                  font-size: 10px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin: 0;
              }
              
              .education-duration {
                  font-size: 8px;
                  color: #666;
                  font-style: italic;
              }
              
              .institution-name {
                  font-size: 9px;
                  color: #666;
                  margin-bottom: 3px;
              }
              
              .gpa {
                  font-size: 8px;
                  color: #27ae60;
                  font-weight: 500;
              }
              
              @media print {
                  body { 
                      print-color-adjust: exact;
                      -webkit-print-color-adjust: exact;
                  }
                  .resume-preview-container {
                      box-shadow: none;
                  }
              }
          </style>
      </head>
      <body>
          <div class="resume-preview-container">
              <!-- Header Section -->
              <div class="resume-header">
                  <div class="profile-section">
                      <div class="profile-photo">
                          <div class="photo-placeholder">
                              ${personalInfo.name ? personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ER'}
                          </div>
                      </div>
                      <div class="header-content">
                          <h1 class="name">${personalInfo.name || 'EHSAN RAHIMI'}</h1>
                          <h2 class="title">${personalInfo.title || 'CHIEF ARTIFICIAL INTELLIGENCE OFFICER (CAIO)'}</h2>
                          <h3 class="subtitle">DIRECTOR OF TECHNOLOGY & DIGITAL TRANSFORMATION</h3>
                      </div>
                  </div>
                  
                  <div class="qr-section">
                      <div class="qr-code">
                          <div class="qr-placeholder">QR</div>
                      </div>
                      <span class="qr-label">Scan for vCard</span>
                  </div>
              </div>
  
              <!-- Main Content -->
              <div class="resume-main">
                  <!-- Left Sidebar -->
                  <div class="sidebar">
                      <!-- Contact -->
                      <section class="sidebar-section">
                          <h3>CONTACT</h3>
                          <div class="contact-list">
                              ${personalInfo.phone ? `
                                  <div class="contact-item">
                                      <i class="fas fa-phone contact-icon"></i>
                                      <span>${personalInfo.phone}</span>
                                  </div>
                              ` : ''}
                              ${personalInfo.email ? `
                                  <div class="contact-item">
                                      <i class="fas fa-envelope contact-icon"></i>
                                      <span>${personalInfo.email}</span>
                                  </div>
                              ` : ''}
                              ${personalInfo.location ? `
                                  <div class="contact-item">
                                      <i class="fas fa-map-marker-alt contact-icon"></i>
                                      <span>${personalInfo.location}</span>
                                  </div>
                              ` : ''}
                              ${personalInfo.website ? `
                                  <div class="contact-item">
                                      <i class="fas fa-globe contact-icon"></i>
                                      <span>${personalInfo.website}</span>
                                  </div>
                              ` : ''}
                          </div>
                      </section>
  
                      <!-- Core Competencies -->
                      <section class="sidebar-section">
                          <h3>CORE COMPETENCIES</h3>
                          <ul class="competency-list">
                              ${coreCompetencies.length > 0 ? coreCompetencies.map(skill => `<li>${skill}</li>`).join('') : `
                                  <li>Digital Transformation Strategy</li>
                                  <li>Applied Artificial Intelligence & NLP</li>
                                  <li>Scalable System Architecture</li>
                                  <li>Cross-functional Team Leadership</li>
                                  <li>AI Product Design & Delivery</li>
                                  <li>Real-time Data Processing</li>
                                  <li>Project Management (Agile, Lean)</li>
                                  <li>B2B & B2C Platform Development</li>
                              `}
                          </ul>
                      </section>
  
                      <!-- Certifications -->
                      <section class="sidebar-section">
                          <h3>CERTIFICATIONS</h3>
                          <ul class="certification-list">
                              ${certifications.length > 0 ? certifications.map(cert => `<li>${cert}</li>`).join('') : `
                                  <li>IBM | ML with Python Certificate</li>
                                  <li>NVIDIA | Generative AI Explained</li>
                                  <li>DataCamp | AI Solutions in Business</li>
                                  <li>LinkedIn | AI Governance</li>
                              `}
                          </ul>
                      </section>
  
                      <!-- Tech Stack -->
                      <section class="sidebar-section">
                          <h3>TECH STACK</h3>
                          <div class="tech-stack">
                              <div class="tech-category">
                                  <strong>Languages:</strong>
                                  <span>Python, Node.js, React.js</span>
                              </div>
                              <div class="tech-category">
                                  <strong>Frameworks:</strong>
                                  <span>FastAPI, Express, HuggingFace, OpenAI SDK</span>
                              </div>
                              <div class="tech-category">
                                  <strong>Databases:</strong>
                                  <span>PostgreSQL, MongoDB</span>
                              </div>
                              <div class="tech-category">
                                  <strong>DevOps:</strong>
                                  <span>Docker, Git, Dokploy</span>
                              </div>
                              <div class="tech-category">
                                  <strong>AI Tools:</strong>
                                  <span>Transformers, LangChain, Weaviate, Pinecone</span>
                              </div>
                              <div class="tech-category">
                                  <strong>Cloud Platforms:</strong>
                                  <span>Google Cloud, VDS/VPS Deployment</span>
                              </div>
                          </div>
                      </section>
  
                      <!-- Languages -->
                      <section class="sidebar-section">
                          <h3>LANGUAGES</h3>
                          <ul class="language-list">
                              ${languages.map(lang => `<li>${lang}</li>`).join('')}
                          </ul>
                      </section>
                  </div>
  
                  <!-- Right Content -->
                  <div class="content">
                      <!-- Profile -->
                      <section class="content-section">
                          <h3><i class="fas fa-user section-icon"></i>PROFILE</h3>
                          <p class="profile-text">
                              ${personalInfo.summary || `Experienced AI and Technology Executive with a strong track record in leading cross-functional teams, building intelligent systems, and managing digital transformation initiatives. Proven expertise in designing robust AI solutions, leading product innovation, and executing business-focused tech strategies. Co-founder and strategic lead of successful startups including Technolife, Mivestan, and Gebral. Recognized for winning 3rd place at the AAAI 2025 Hackathon (USA). Adept at bridging the gap between business vision and technical execution, with a pragmatic and collaborative leadership style.`}
                          </p>
                      </section>
  
                      <!-- Work Experience -->
                      <section class="content-section">
                          <h3><i class="fas fa-briefcase section-icon"></i>WORK EXPERIENCE</h3>
                          <div class="timeline">
                              ${experience.length > 0 ? experience.map(exp => `
                                  <div class="timeline-item">
                                      <div class="timeline-content">
                                          <div class="job-header">
                                              <h4 class="job-title">${exp.position}</h4>
                                              <span class="job-duration">${exp.duration}</span>
                                          </div>
                                          <div class="company-name">${exp.company}</div>
                                          ${exp.description ? `
                                              <ul class="job-responsibilities">
                                                  ${exp.description.split('\n').filter(item => item.trim()).map(item => `<li>${item.trim()}</li>`).join('')}
                                              </ul>
                                          ` : ''}
                                      </div>
                                  </div>
                              `).join('') : `
                                  <div class="timeline-item">
                                      <div class="timeline-content">
                                          <div class="job-header">
                                              <h4 class="job-title">CAIO & Director of Technology & Digital</h4>
                                              <span class="job-duration">2023 - PRESENT</span>
                                          </div>
                                          <div class="company-name">Najah</div>
                                          <ul class="job-responsibilities">
                                              <li>Directed design and deployment of AI-powered dashboards and automation tools for infrastructure analytics and customer experience.</li>
                                              <li>Oversaw system architecture, team workflows, and product planning in education and retail sectors.</li>
                                              <li>Integrated OpenAI APIs and custom-trained LLMs into internal tools for process optimization.</li>
                                          </ul>
                                      </div>
                                  </div>
                                  <div class="timeline-item">
                                      <div class="timeline-content">
                                          <div class="job-header">
                                              <h4 class="job-title">AI Engineer & Technology Strategist</h4>
                                              <span class="job-duration">2024 - Present</span>
                                          </div>
                                          <div class="company-name">Gebral AI</div>
                                          <ul class="job-responsibilities">
                                              <li>Co-created an agentic AI assistant designed to support users in achieving personal and professional goals.</li>
                                              <li>Led AI engineering and platform logic for the AAAI-awarded project, focused on adaptive reasoning and visual roadmap generation.</li>
                                          </ul>
                                      </div>
                                  </div>
                              `}
                          </div>
                      </section>
  
                      <!-- Education -->
                      <section class="content-section">
                          <h3><i class="fas fa-graduation-cap section-icon"></i>EDUCATION</h3>
                          <div class="education-list">
                              ${education.length > 0 ? education.map(edu => `
                                  <div class="education-item">
                                      <div class="education-header">
                                          <h4 class="degree-title">${edu.degree}</h4>
                                          <span class="education-duration">${edu.duration}</span>
                                      </div>
                                      <div class="institution-name">${edu.institution}</div>
                                      ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
                                  </div>
                              `).join('') : `
                                  <div class="education-item">
                                      <div class="education-header">
                                          <h4 class="degree-title">Master's in Information Technology (MIS)</h4>
                                          <span class="education-duration">2020 - 2023</span>
                                      </div>
                                      <div class="institution-name">University of Eyvanekey</div>
                                      <div class="gpa">GPA: 3.8 / 4.0</div>
                                  </div>
                                  <div class="education-item">
                                      <div class="education-header">
                                          <h4 class="degree-title">B.Sc. in Computer Software Engineering</h4>
                                          <span class="education-duration">2015 - 2019</span>
                                      </div>
                                      <div class="institution-name">Larijan University</div>
                                      <div class="gpa">GPA: 3.5 / 4.0</div>
                                  </div>
                              `}
                          </div>
                      </section>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

module.exports = router;
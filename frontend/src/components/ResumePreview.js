import React from 'react';
import { Phone, Mail, MapPin, Globe, User, Briefcase, GraduationCap } from 'lucide-react';
import { photoAPI } from '../services/api';
import './ResumePreview.css';

const ResumePreview = ({ resumeData }) => {
  if (!resumeData) return null;

  const { personalInfo = {}, experience = [], education = [], skills = [], certifications = [], languages = ['English'] } = resumeData;

  // Core competencies (first 10 skills)
  const coreCompetencies = skills.slice(0, 10);

  // Photo handling
  const showPhoto = personalInfo.showPhoto !== false; // Default to true
  const hasPhoto = personalInfo.photo?.filename;
  const photoUrl = hasPhoto ? photoAPI.getPhotoUrl(personalInfo.photo.filename) : null;

  return (
    <div className="resume-preview-container">
      {/* Header Section */}
      <div className={`resume-header ${!showPhoto ? 'no-photo' : ''}`}>
        <div className="profile-section">
          {showPhoto && (
            <div className="profile-photo">
              {hasPhoto && photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={personalInfo.name || 'Profile'} 
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="photo-placeholder">
                  {personalInfo.name ? personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ER'}
                </div>
              )}
            </div>
          )}
          <div className="header-content">
            <h1 className="name">{personalInfo.name || 'EHSAN RAHIMI'}</h1>
            <h2 className="title">{personalInfo.title || 'CHIEF ARTIFICIAL INTELLIGENCE OFFICER (CAIO)'}</h2>
          </div>
        </div>
        
        <div className="qr-section">
          <div className="qr-code">
            <div className="qr-placeholder">QR</div>
          </div>
          <span className="qr-label">Scan for vCard</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="resume-main">
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* Contact */}
          <section className="sidebar-section">
            <h3>CONTACT</h3>
            <div className="contact-list">
              {personalInfo.phone && (
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="contact-item">
                  <Globe className="contact-icon" />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </section>

          {/* Core Competencies */}
          <section className="sidebar-section">
            <h3>CORE COMPETENCIES</h3>
            <ul className="competency-list">
              {coreCompetencies.length > 0 ? coreCompetencies.map((skill, index) => (
                <li key={index}>{skill}</li>
              )) : [
                'Digital Transformation Strategy',
                'Applied Artificial Intelligence & NLP',
                'Scalable System Architecture',
                'Cross-functional Team Leadership',
                'AI Product Design & Delivery',
                'Real-time Data Processing',
                'Project Management (Agile, Lean)',
                'B2B & B2C Platform Development'
              ].map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </section>

          {/* Certifications */}
          <section className="sidebar-section">
            <h3>CERTIFICATIONS</h3>
            <ul className="certification-list">
              {certifications.length > 0 ? certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              )) : [
                'IBM | ML with Python Certificate',
                'NVIDIA | Generative AI Explained',
                'DataCamp | AI Solutions in Business',
                'LinkedIn | AI Governance'
              ].map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </section>

          {/* Tech Stack */}
          <section className="sidebar-section">
            <h3>TECH STACK</h3>
            <div className="tech-stack">
              <div className="tech-category">
                <strong>Languages:</strong>
                <span>Python, Node.js, React.js</span>
              </div>
              <div className="tech-category">
                <strong>Frameworks:</strong>
                <span>FastAPI, Express, HuggingFace, OpenAI SDK</span>
              </div>
              <div className="tech-category">
                <strong>Databases:</strong>
                <span>PostgreSQL, MongoDB</span>
              </div>
              <div className="tech-category">
                <strong>DevOps:</strong>
                <span>Docker, Git, Dokploy</span>
              </div>
              <div className="tech-category">
                <strong>AI Tools:</strong>
                <span>Transformers, LangChain, Weaviate, Pinecone</span>
              </div>
              <div className="tech-category">
                <strong>Cloud Platforms:</strong>
                <span>Google Cloud, VDS/VPS Deployment</span>
              </div>
            </div>
          </section>

          {/* Languages */}
          <section className="sidebar-section">
            <h3>LANGUAGES</h3>
            <ul className="language-list">
              {languages.map((lang, index) => (
                <li key={index}>{lang}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Content */}
        <div className="content">
          {/* Profile */}
          <section className="content-section">
            <h3><User className="section-icon" />PROFILE</h3>
            <p className="profile-text">
              {personalInfo.summary || `Experienced AI and Technology Executive with a strong track record in leading cross-functional teams, building intelligent systems, and managing digital transformation initiatives. Proven expertise in designing robust AI solutions, leading product innovation, and executing business-focused tech strategies. Co-founder and strategic lead of successful startups including Technolife, Mivestan, and Gebral. Recognized for winning 3rd place at the AAAI 2025 Hackathon (USA). Adept at bridging the gap between business vision and technical execution, with a pragmatic and collaborative leadership style.`}
            </p>
          </section>

          {/* Work Experience */}
          <section className="content-section">
            <h3><Briefcase className="section-icon" />WORK EXPERIENCE</h3>
            <div className="timeline">
              {experience.length > 0 ? experience.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-content">
                    <div className="job-header">
                      <h4 className="job-title">{exp.position}</h4>
                      <span className="job-duration">{exp.duration}</span>
                    </div>
                    <div className="company-name">{exp.company}</div>
                    {exp.description && (
                      <ul className="job-responsibilities">
                        {exp.description.split('\n').filter(item => item.trim()).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )) : (
                <>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="job-header">
                        <h4 className="job-title">CAIO & Director of Technology & Digital</h4>
                        <span className="job-duration">2023 - PRESENT</span>
                      </div>
                      <div className="company-name">Najah</div>
                      <ul className="job-responsibilities">
                        <li>Directed design and deployment of AI-powered dashboards and automation tools for infrastructure analytics and customer experience.</li>
                        <li>Oversaw system architecture, team workflows, and product planning in education and retail sectors.</li>
                        <li>Integrated OpenAI APIs and custom-trained LLMs into internal tools for process optimization.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-content">
                      <div className="job-header">
                        <h4 className="job-title">AI Engineer & Technology Strategist</h4>
                        <span className="job-duration">2024 - Present</span>
                      </div>
                      <div className="company-name">Gebral AI</div>
                      <ul className="job-responsibilities">
                        <li>Co-created an agentic AI assistant designed to support users in achieving personal and professional goals.</li>
                        <li>Led AI engineering and platform logic for the AAAI-awarded project, focused on adaptive reasoning and visual roadmap generation.</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Education */}
          <section className="content-section">
            <h3><GraduationCap className="section-icon" />EDUCATION</h3>
            <div className="education-list">
              {education.length > 0 ? education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <h4 className="degree-title">{edu.degree}</h4>
                    <span className="education-duration">{edu.duration}</span>
                  </div>
                  <div className="institution-name">{edu.institution}</div>
                  {edu.gpa && <div className="gpa">GPA: {edu.gpa}</div>}
                </div>
              )) : (
                <>
                  <div className="education-item">
                    <div className="education-header">
                      <h4 className="degree-title">Master's in Information Technology (MIS)</h4>
                      <span className="education-duration">2020 - 2023</span>
                    </div>
                    <div className="institution-name">University of Eyvanekey</div>
                    <div className="gpa">GPA: 3.8 / 4.0</div>
                  </div>
                  <div className="education-item">
                    <div className="education-header">
                      <h4 className="degree-title">B.Sc. in Computer Software Engineering</h4>
                      <span className="education-duration">2015 - 2019</span>
                    </div>
                    <div className="institution-name">Larijan University</div>
                    <div className="gpa">GPA: 3.5 / 4.0</div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
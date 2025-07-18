const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Create indexes for better performance
    console.log('🔄 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    
    // Resume indexes
    await Resume.collection.createIndex({ user: 1, createdAt: -1 });
    await Resume.collection.createIndex({ user: 1, title: 1 });
    await Resume.collection.createIndex({ user: 1, isActive: 1 });
    await Resume.collection.createIndex({ 
      title: 'text', 
      description: 'text',
      'personalInfo.name': 'text',
      'personalInfo.title': 'text'
    });

    console.log('✅ Database indexes created successfully');

    // Create demo user (optional - for testing)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Creating demo user...');
      
      const demoUser = await User.findOne({ email: 'demo@resumebuilder.com' });
      if (!demoUser) {
        const newDemoUser = new User({
          name: 'Demo User',
          email: 'demo@resumebuilder.com',
          password: 'demo123',
          isVerified: true
        });
        
        await newDemoUser.save();
        console.log('✅ Demo user created: demo@resumebuilder.com / demo123');
        
        // Create a sample resume
        const sampleResume = new Resume({
          user: newDemoUser._id,
          title: 'Software Engineer - Demo Company',
          description: 'Sample resume for demonstration purposes',
          personalInfo: {
            name: 'Demo User',
            title: 'Senior Software Engineer',
            email: 'demo@resumebuilder.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            website: 'https://demo-portfolio.com',
            summary: 'Experienced software engineer with expertise in full-stack development, AI integration, and cloud technologies. Passionate about building scalable applications that solve real-world problems.'
          },
          experience: [
            {
              company: 'Tech Solutions Inc.',
              position: 'Senior Software Engineer',
              duration: '2022 - Present',
              description: 'Led development of microservices architecture\nImplemented CI/CD pipelines reducing deployment time by 60%\nMentored junior developers and conducted code reviews'
            },
            {
              company: 'StartupXYZ',
              position: 'Full Stack Developer',
              duration: '2020 - 2022',
              description: 'Built responsive web applications using React and Node.js\nDeveloped RESTful APIs serving 100K+ daily requests\nOptimized database queries improving performance by 40%'
            }
          ],
          education: [
            {
              institution: 'University of California, Berkeley',
              degree: 'Bachelor of Science in Computer Science',
              duration: '2016 - 2020',
              gpa: '3.8'
            }
          ],
          skills: [
            'JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 
            'MongoDB', 'PostgreSQL', 'Git', 'Agile Development'
          ],
          certifications: [
            'AWS Certified Solutions Architect',
            'Google Cloud Professional Developer',
            'Scrum Master Certification'
          ],
          languages: ['English', 'Spanish'],
          projects: [
            {
              name: 'E-commerce Platform',
              description: 'Built a full-stack e-commerce solution with payment integration',
              technologies: ['React', 'Node.js', 'Stripe API', 'MongoDB']
            }
          ]
        });
        
        await sampleResume.save();
        
        // Add resume to user's resumes array
        newDemoUser.resumes.push(sampleResume._id);
        await newDemoUser.save();
        
        console.log('✅ Sample resume created for demo user');
      } else {
        console.log('ℹ️  Demo user already exists');
      }
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
};

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
require('dotenv').config();

const migrateExistingResumes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    console.log('🔄 Migrating existing resumes to support photo features...');
    
    // Update all existing resumes to have showPhoto: true by default
    const result = await Resume.updateMany(
      { 'personalInfo.showPhoto': { $exists: false } },
      { 
        $set: { 
          'personalInfo.showPhoto': true 
        } 
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${result.modifiedCount} resumes with photo settings`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateExistingResumes()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateExistingResumes;
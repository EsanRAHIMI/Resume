// Optional: Cloud storage integration for production
const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

class CloudStorageService {
  // Upload file to S3
  static async uploadPhoto(filePath, fileName) {
    if (!BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME not configured');
    }

    try {
      const fileContent = await fs.readFile(filePath);
      
      const params = {
        Bucket: BUCKET_NAME,
        Key: `photos/${fileName}`,
        Body: fileContent,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
        CacheControl: 'max-age=31536000' // 1 year
      };

      const result = await s3.upload(params).promise();
      
      // Clean up local file
      await fs.unlink(filePath);
      
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  // Delete file from S3
  static async deletePhoto(fileName) {
    if (!BUCKET_NAME) {
      throw new Error('S3_BUCKET_NAME not configured');
    }

    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: `photos/${fileName}`
      };

      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }

  // Get file URL
  static getPhotoUrl(fileName) {
    if (!BUCKET_NAME) {
      return null;
    }
    
    return `https://${BUCKET_NAME}.s3.amazonaws.com/photos/${fileName}`;
  }
}

module.exports = CloudStorageService;
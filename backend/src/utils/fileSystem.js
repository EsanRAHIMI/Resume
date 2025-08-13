// backend/src/utils/fileSystem.js
const fs = require('fs').promises;
const path = require('path');

/**
 * اطمینان از وجود پوشه‌های مورد نیاز
 */
const ensureDirectories = async () => {
  const directories = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/photos'),
    path.join(__dirname, '../../uploads/resumes')
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
      console.log(`✅ Directory exists: ${dir}`);
    } catch (error) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Directory created: ${dir}`);
      } catch (createError) {
        console.error(`❌ Failed to create directory ${dir}:`, createError);
        throw createError;
      }
    }
  }
};

/**
 * بررسی مجوزهای پوشه
 */
const checkDirectoryPermissions = async (dirPath) => {
  try {
    // تست نوشتن فایل
    const testFile = path.join(dirPath, 'test.txt');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    console.log(`✅ Directory writable: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Directory not writable: ${dirPath}`, error);
    return false;
  }
};

module.exports = {
  ensureDirectories,
  checkDirectoryPermissions
};
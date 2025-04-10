// utils/googleDrive.js - STUB
console.log('Google Drive functionality disabled - using stub implementation');

// Ekspor fungsi dummy untuk mencegah error
module.exports = {
  uploadFile: async () => ({ id: 'disabled', webViewLink: '#' }),
  createFolder: async () => ({ id: 'disabled' }),
  downloadFile: async () => Buffer.from(''),
  deleteFile: async () => true,
  listFiles: async () => [],
  generatePublicUrl: async () => '#'
};
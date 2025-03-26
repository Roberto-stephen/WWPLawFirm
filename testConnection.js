// testConnection.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Mencoba terhubung ke MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Koneksi ke MongoDB Atlas berhasil!');
    
    // Cek daftar koleksi
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Koleksi dalam database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Gagal terhubung ke MongoDB Atlas:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Koneksi MongoDB ditutup');
    }
  }
}

testConnection();
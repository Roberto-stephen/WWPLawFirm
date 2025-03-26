// createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Sesuaikan path jika perlu

// Fungsi untuk hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Data pengguna yang ingin ditambahkan
const usersToAdd = [
  {
    username: "Admin WWP",
    email: "admin@wwplawfirm.com",
    number: "081234567890",
    address: "Kantor Pusat WWP Law Firm",
    password: "admin123", // Akan di-hash secara otomatis
    avatar_url: "",
    type: "admin"
  },
  {
    username: "Klien Demo",
    email: "klien@example.com",
    number: "087654321098",
    address: "Jl. Contoh No. 123, Jakarta",
    password: "client123", // Akan di-hash secara otomatis
    avatar_url: "",
    type: "client"
  }
  // Tambahkan user lain jika diperlukan
];

async function createUsers() {
  try {
    // Buat koneksi ke MongoDB
    console.log('Menghubungkan ke MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wwplawfirm');
    console.log('Berhasil terhubung ke MongoDB');

    let successCount = 0;
    let errorCount = 0;

    // Proses setiap user dalam array
    for (const userData of usersToAdd) {
      try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`[LEWATI] User dengan email ${userData.email} sudah ada di database.`);
          errorCount++;
          continue;
        }

        // Cek apakah nomor telepon sudah terdaftar
        const existingNumber = await User.findOne({ number: userData.number });
        
        if (existingNumber) {
          console.log(`[LEWATI] Nomor telepon ${userData.number} sudah digunakan.`);
          errorCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Buat user baru dengan password yang sudah di-hash
        const newUser = new User({
          ...userData,
          password: hashedPassword
        });
        
        // Simpan ke database
        await newUser.save();
        
        console.log(`[SUKSES] User "${userData.username}" (${userData.email}) berhasil ditambahkan!`);
        successCount++;
        
      } catch (err) {
        console.error(`[ERROR] Gagal menambahkan ${userData.email}:`, err.message);
        errorCount++;
      }
    }

    // Tampilkan ringkasan hasil
    console.log('\n==== RINGKASAN ====');
    console.log(`Total user yang ditambahkan: ${successCount}`);
    console.log(`Total user yang gagal: ${errorCount}`);
    console.log('===================\n');

  } catch (error) {
    console.error('[ERROR] Terjadi kesalahan:', error.message);
  } finally {
    // Tutup koneksi MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Koneksi MongoDB ditutup');
    }
  }
}

// Jalankan fungsi utama
createUsers();
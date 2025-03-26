// reset-users.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    // Dapatkan model User dari MongoDB
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      number: String,
      address: String,
      avatar_url: String,
      type: String
    }, { timestamps: true }));
    
    // Fungsi untuk membuat atau mereset password
    async function handleUser(email, username, type, additionalData = {}) {
      // Cari user berdasarkan email
      let user = await User.findOne({ email });
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`${type}123`, salt);
      
      if (user) {
        console.log(`${type} user found! Updating user...`);
        
        // Update user yang ada
        user.username = username;
        user.password = hashedPassword;
        user.type = type;
        // Tidak mengubah number untuk menghindari duplicate key error
        
        if (additionalData.address) user.address = additionalData.address;
        if (additionalData.avatar_url) user.avatar_url = additionalData.avatar_url;
        
        await user.save();
        console.log(`Updated ${type} user with password: ${type}123`);
      } else {
        // Cek apakah nomor telepon sudah digunakan
        if (additionalData.number) {
          const existingUserWithNumber = await User.findOne({ number: additionalData.number });
          if (existingUserWithNumber) {
            console.log(`Phone number ${additionalData.number} already used by ${existingUserWithNumber.email}`);
            // Generate nomor telepon unik
            additionalData.number = `${additionalData.number.substring(0, 8)}${Math.floor(Math.random() * 1000)}`;
            console.log(`Using new number: ${additionalData.number}`);
          }
        }
        
        console.log(`Creating new ${type} user...`);
        
        // Buat user baru
        const newUser = new User({
          username,
          email,
          password: hashedPassword,
          type,
          number: additionalData.number || `08${Math.floor(Math.random() * 1000000000)}`,
          address: additionalData.address || 'Jakarta, Indonesia',
          avatar_url: additionalData.avatar_url || '',
        });
        
        await newUser.save();
        console.log(`Created new ${type} user with password: ${type}123`);
      }
      
      // Return data for summary
      return await User.findOne({ email });
    }
    
    // Reset admin user
    const adminUser = await handleUser(
      'admin@wwplawfirm.com', 
      'Admin WWP', 
      'admin',
      {
        number: '081234567890',
        address: 'Kantor Pusat WWP Law Firm'
      }
    );
    
    // Reset client user dengan nomor telepon unik
    const clientUser = await handleUser(
      'client@example.com', 
      'Klien Demo', 
      'client',
      {
        number: `0876${Math.floor(Math.random() * 10000000)}`, // Nomor telepon acak
        address: 'Jl. Contoh No. 1234, Jakarta'
      }
    );
    
    console.log('\nSUMMARY:');
    console.log('Admin User:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Phone: ${adminUser.number}`);
    console.log('  Password: admin123');
    console.log('Client User:');
    console.log(`  Email: ${clientUser.email}`);
    console.log(`  Phone: ${clientUser.number}`);
    console.log('  Password: client123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetUsers();
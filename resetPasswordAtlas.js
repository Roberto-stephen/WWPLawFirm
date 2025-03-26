// resetPasswordAtlas.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    console.log('Menghubungkan ke MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Koneksi berhasil!');
    
    const User = mongoose.model('User');
    
    // Hash password baru yang simpel
    const salt = await bcrypt.genSalt(10);
    const newPassword = 'Simple123!';
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password untuk admin
    const updateResult = await User.updateOne(
      { email: 'admin@wwplawfirm.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Reset password admin:', updateResult.modifiedCount > 0 ? 'Berhasil' : 'Gagal');
    if (updateResult.modifiedCount > 0) {
      console.log('=============================================');
      console.log('Password baru: ' + newPassword);
      console.log('=============================================');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Koneksi MongoDB ditutup');
  }
}

resetPassword();
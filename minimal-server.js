// minimal-server.js - Server lengkap untuk debugging login
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
console.log('Environment loaded');

// Initialize express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log('Initializing minimal server...');

// Coba load model User
let User;
try {
  User = require('./models/user');
  console.log('User model loaded successfully');
} catch (error) {
  console.error('Error loading User model:', error.message);
}

// Simple root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.send(`
    <html>
      <head>
        <title>Minimal Debug Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .btn { display: inline-block; padding: 10px 15px; background: #4a90e2; color: white; 
                 text-decoration: none; border-radius: 4px; margin: 10px 5px 10px 0; }
        </style>
      </head>
      <body>
        <h1>Debug Server</h1>
        <p>Server minimal untuk debugging sedang berjalan.</p>
        <div>
          <a href="/debug" class="btn">Cek Status Server</a>
          <a href="/db-test" class="btn">Cek Koneksi Database</a>
          <a href="/check-user-model" class="btn">Cek Model User</a>
          <a href="/login-test.html" class="btn">Test Form Login</a>
        </div>
      </body>
    </html>
  `);
});

// Debug endpoint
app.get('/debug', (req, res) => {
  console.log('Debug endpoint accessed');
  res.json({
    status: 'running',
    time: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET
    }
  });
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
  console.log('Attempting database connection...');
  
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('Already connected to MongoDB');
    }
    
    res.json({
      status: 'connected',
      dbName: mongoose.connection.db.databaseName
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Login test endpoint
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Test login attempt with:', email);
    
    // Cek input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email dan password diperlukan'
      });
    }
    
    // Cek jika User model tersedia
    if (!User) {
      return res.status(500).json({
        status: 'error',
        message: 'User model tidak tersedia'
      });
    }
    
    // Pastikan koneksi DB aktif
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Coba temukan user di database
    console.log('Searching for user in database...');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan'
      });
    }
    
    console.log('User found:', user.email);
    
    // Coba validasi password - menggunakan metode model jika tersedia
    console.log('Attempting password validation...');
    
    let isMatch = false;
    if (typeof user.validatePassword === 'function') {
      isMatch = await user.validatePassword(password);
    } else {
      // Fallback jika metode tidak tersedia
      const bcrypt = require('bcryptjs');
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    if (isMatch) {
      console.log('Password valid');
      return res.json({
        status: 'success',
        message: 'Login berhasil',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          type: user.type
        }
      });
    } else {
      console.log('Password invalid');
      return res.status(401).json({
        status: 'error',
        message: 'Password salah'
      });
    }
  } catch (error) {
    console.error('Login test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Endpoint untuk memeriksa model User
app.get('/check-user-model', async (req, res) => {
  try {
    // Cek koneksi DB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Cek apakah model User tersedia
    if (!User) {
      return res.status(500).json({
        status: 'error',
        message: 'User model tidak tersedia',
        possibleCauses: [
          'File models/user.js tidak ditemukan',
          'Error saat importing model'
        ]
      });
    }
    
    // Cek model info
    const modelInfo = {
      modelExists: !!mongoose.models.User,
      modelName: mongoose.models.User ? mongoose.models.User.modelName : null,
      collectionName: mongoose.models.User ? mongoose.models.User.collection.name : null,
      hasValidatePassword: typeof User.prototype.validatePassword === 'function'
    };
    
    // Coba hitung jumlah user
    const userCount = await User.countDocuments();
    
    // Coba ambil user pertama sebagai contoh (tanpa menampilkan password)
    const sampleUser = await User.findOne().select('-password');
    
    res.json({
      status: 'success',
      db: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.db.databaseName
      },
      model: modelInfo,
      stats: {
        userCount,
        sampleUser: sampleUser ? {
          id: sampleUser._id,
          email: sampleUser.email,
          type: sampleUser.type
        } : null
      }
    });
  } catch (error) {
    console.error('User model check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Start the server
const PORT = 9001;
app.listen(PORT, () => {
  console.log(`Minimal server is running on http://localhost:${PORT}`);
  console.log(`Try accessing the following URLs:`);
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/debug`);
  console.log(`  - http://localhost:${PORT}/db-test`);
  console.log(`  - http://localhost:${PORT}/check-user-model`);
  console.log(`  - http://localhost:${PORT}/login-test.html`);
});

// Export untuk Vercel
module.exports = app;
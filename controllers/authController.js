const User = require('../models/user');
const { UnauthorizedAccessError } = require('../helpers/exceptions');
const jwt = require('jsonwebtoken');

// Hapus import helper auth.js karena kita akan menggunakan metode dari model User

const test = (req, res) => {
    res.json('tests is working');
};

const registerUser = async (req, res) => {
    try {
        const { email, password, username, number, address } = req.body;
        
        // Check empty values
        if (!email) {
            return res.status(400).json({
                error: 'Email is required!'
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                error: 'Password of at least 6 characters long is required!'
            });
        }

        if (!username || !number || !address) {
            return res.status(400).json({
                error: 'Username, number, and address are required!'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already in use'
            });
        }
        
        // Buat user baru - password akan otomatis di-hash oleh middleware pre-save
        const newUser = new User({
            username,
            email,
            number,
            address,
            password, // Pre-save middleware akan hash password
            avatar_url: "",
            type: "client",
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'User registration failed', details: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email dan password harus diisi'
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'User tidak ditemukan'
            });
        }
        
        // Gunakan metode validatePassword dari model User
        const match = await user.validatePassword(password);
        
        if (match) {
            // Update lastLogin timestamp
            user.lastLogin = new Date();
            await user.save();
            
            // Buat token dengan masa aktif yang lebih lama (24 jam)
            const token = jwt.sign({
                email: user.email,
                userId: user._id,
                name: user.username,
                type: user.type
            }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            // Set cookie juga untuk keamanan tambahan
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 jam
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            
            // Kirim token dan info user
            return res.status(200).json({
                token: token,
                name: user.username,
                type: user.type
            });
        } else {
            return res.status(401).json({
                error: 'Password salah'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Endpoint baru untuk verifikasi token
const verifyToken = (req, res) => {
    // Token sudah diverifikasi oleh middleware requireAuth
    // Jika sudah sampai di sini, berarti token valid
    return res.status(200).json({
        valid: true,
        user: {
            userId: req.user.userId,
            name: req.user.name,
            type: req.user.type
        }
    });
};

const setUserInfo = (req, res, next) => {
    try {
      if (req.user) {
        res.locals.userInfo = {
          userId: req.user.userId,
          name: req.user.name,
          type: req.user.type
        };
      }
      next();
    } catch (error) {
      console.error("Error setting user info:", error);
      next();
    }
  };

const readUser = (req, res) => {
    // Implementasi dapat ditambahkan sesuai kebutuhan
};

module.exports = { test, registerUser, loginUser, readUser, verifyToken, setUserInfo };
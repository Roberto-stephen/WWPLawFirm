const User = require('../models/user');
const { UnauthorizedAccessError } = require('../helpers/exceptions');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('tests is working');
};

const registerUser = async (req, res) => {
    try {
        const { email, password, username, number, address } = req.body;
        
        // check empty value
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

        if (!username) {
            return res.status(400).json({
                error: 'Username is required!'
            });
        } 
        if (!number) {
            return res.status(400).json({
                error: 'Number is required!'
            });
        }
        if (!address) {
            return res.status(400).json({
                error: 'Address is required!'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email already in use'
            });
        }

        const hashedPassword = await hashPassword(password);
        
        // Create user record in db
        const newUser = new User({
            username, 
            email, 
            number, 
            address, 
            password: hashedPassword, 
            avatar_url: "", 
            type: "client",
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'User registration failed' });
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
        
        const match = await comparePassword(password, user.password);
        
        if (match) {
            // Buat token
            const token = jwt.sign({
                email: user.email,
                userId: user._id,
                name: user.username,
                type: user.type
            }, process.env.JWT_SECRET, { expiresIn: '2h' });
            
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
            error: 'Internal server error'
        });
    }
};

const readUser = (req, res) => {
    // Implementasi ini bisa ditambahkan sesuai kebutuhan
};

module.exports = { test, registerUser, loginUser, readUser };
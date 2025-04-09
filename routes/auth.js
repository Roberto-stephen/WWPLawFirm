const express = require('express');
const router = express.Router();

// Import controller dan middleware
const { 
    test, 
    registerUser, 
    loginUser, 
    readUser, 
    verifyToken 
} = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Test route
router.get('/test', test);

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Verify token route
router.get('/verify', requireAuth, verifyToken);

// User data route
router.get('/user', requireAuth, readUser);

module.exports = router;
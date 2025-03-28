const express = require('express');
const router = express.Router();
const { test, registerUser, loginUser, readUser } = require('../controllers/authController');

// Enhanced login handler dengan logging ekstensif
router.post('/login', (req, res) => {
  console.log('Login route hit in auth.js');
  console.log('Request body:', req.body);
  
  try {
    loginUser(req, res);
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

router.post('/register', registerUser);

// Debug endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'Auth route operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
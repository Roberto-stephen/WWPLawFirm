// routes/crm.js
const multer = require('multer')
const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController')
const {requireAuth} = require('../middlewares/authMiddleware')
const upload = multer({ dest: 'uploads/' })
const User = require('../models/user');

// PENTING: /me harus di atas /:id
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Ambil userId dari token yang diverifikasi
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User ID not found in token"
      });
    }
    
    // Gunakan fungsi listSelectedUser dengan parameter userId
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: "NotFound",
        message: "User not found"
      });
    }
    
    // Kembalikan data user
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      error: error.name || "ServerError",
      message: error.message || "An unexpected error occurred"
    });
  }
});

// API untuk clients dan employees
router.get('/clients', requireAuth, crmController.listUser)
router.get('/employees', requireAuth, crmController.listEmployee)

// Endpoint lama tetap dipertahankan untuk backward compatibility
router.get('/', requireAuth, crmController.listUser) 
router.get('/employee', requireAuth, crmController.listEmployee)

// PERHATIAN: /:id harus berada di bawah /me dan endpoint spesifik lainnya
router.get('/:id', requireAuth, crmController.listSelectedUser)

router.post('/', requireAuth, crmController.createUser)
router.put('/p', requireAuth, crmController.updatePassword)
router.put('/u/:id', requireAuth, upload.single('avatar_url'), crmController.updateUser)
router.put('/:id', requireAuth, crmController.updateUser)
router.delete('/:id', requireAuth, crmController.deleteUser)

module.exports = router;
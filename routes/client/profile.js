const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const crmController = require('../../controllers/crmController');
const upload = require('../../config/multer');

// GET /api/client/profile - Get own profile
router.get('/', asyncHandler(async (req, res) => {
  // Override req.params untuk menggunakan ID dari token
  req.params.id = 'self';
  return crmController.listSelectedUser(req, res);
}));

// PUT /api/client/profile - Update own profile
router.put('/', upload.single('avatar'), asyncHandler(async (req, res) => {
  // Override req.params untuk menggunakan ID dari token
  req.params.id = 'self';
  return crmController.updateUser(req, res);
}));

// PUT /api/client/profile/password - Update own password
router.put('/password', asyncHandler(crmController.updatePassword));

module.exports = router;
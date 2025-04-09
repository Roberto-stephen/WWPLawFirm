const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const { validateUserId } = require('../../middlewares/roleMiddleware');
const crmController = require('../../controllers/crmController');
const upload = require('../../config/multer');

// GET /api/admin/users - Get all users
router.get('/', asyncHandler(crmController.listUser));

// GET /api/admin/users/employees - Get all employees
router.get('/employees', asyncHandler(crmController.listEmployee));

// GET /api/admin/users/:id - Get specific user
router.get('/:id', validateUserId, asyncHandler(crmController.listSelectedUser));

// POST /api/admin/users - Create new user
router.post('/', upload.single('avatar'), asyncHandler(crmController.createUser));

// PUT /api/admin/users/:id - Update user
router.put('/:id', validateUserId, upload.single('avatar'), asyncHandler(crmController.updateUser));

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', validateUserId, asyncHandler(crmController.deleteUser));

module.exports = router;
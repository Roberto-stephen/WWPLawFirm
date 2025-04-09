const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const logController = require('../../controllers/logController');

// Log routes
router.get('/', asyncHandler(logController.getLogs));
router.get('/users', asyncHandler(logController.getUserLogs));
router.get('/system', asyncHandler(logController.getSystemLogs));
router.get('/access', asyncHandler(logController.getAccessLogs));
router.delete('/:id', asyncHandler(logController.deleteLog));

module.exports = router;
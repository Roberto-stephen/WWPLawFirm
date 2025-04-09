const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const backupController = require('../../controllers/backupController');

// Backup routes
router.get('/', asyncHandler(backupController.getBackups));
router.post('/', asyncHandler(backupController.createBackup));
router.get('/:id', asyncHandler(backupController.downloadBackup));
router.post('/restore/:id', asyncHandler(backupController.restoreBackup));
router.delete('/:id', asyncHandler(backupController.deleteBackup));

module.exports = router;
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const caseController = require('../../controllers/caseController');

// Sesuaikan dengan nama fungsi yang tersedia di controller
router.get('/', asyncHandler(caseController.listCase));
router.get('/:id', asyncHandler(caseController.readCase));
router.post('/', asyncHandler(caseController.createCase));
router.put('/:id', asyncHandler(caseController.editCase));
router.delete('/:id', asyncHandler(caseController.deleteCase));

module.exports = router;
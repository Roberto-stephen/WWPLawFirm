const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const financeController = require('../../controllers/financeController');
const upload = require('../../config/multer');

// Finance routes
router.get('/', asyncHandler(financeController.getTransactions));
router.get('/summary', asyncHandler(financeController.getFinanceSummary));
router.get('/:id', asyncHandler(financeController.getTransaction));
router.post('/', upload.single('receipt'), asyncHandler(financeController.createTransaction));
router.put('/:id', upload.single('receipt'), asyncHandler(financeController.updateTransaction));
router.delete('/:id', asyncHandler(financeController.deleteTransaction));

module.exports = router;
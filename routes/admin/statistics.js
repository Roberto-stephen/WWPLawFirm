const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const statisticController = require('../../controllers/statisticController');

// Statistics routes
router.get('/cases', asyncHandler(statisticController.getCaseStatistics));
router.get('/users', asyncHandler(statisticController.getUserStatistics));
router.get('/appointments', asyncHandler(statisticController.getAppointmentStatistics));
router.get('/income', asyncHandler(statisticController.getIncomeStatistics));
router.get('/activity', asyncHandler(statisticController.getActivityStatistics));

module.exports = router;
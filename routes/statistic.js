const express = require('express');
const router = express.Router();
const { dashboardStatistic, getNotifications } = require('../controllers/statisticController')
const { requireAuth, requireLawyerAndAdmin, requireAdmin } = require('../middlewares/authMiddleware')

router.get('/dashboard', asyncHandler(statisticController.getDashboardStatistics));
router.get('/dashboard', requireAuth, dashboardStatistic)
router.get('/notifications', requireAuth, getNotifications)

module.exports = router;
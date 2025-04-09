const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middlewares/roleMiddleware');

// Apply admin middleware to all admin routes
router.use(isAdmin);

// Import sub-routes
const usersRoutes = require('./users');
const casesRoutes = require('./cases');
const documentsRoutes = require('./documents');
const appointmentsRoutes = require('./appointments');
const statisticsRoutes = require('./statistics');
const lawyersRoutes = require('./lawyers');
const hearingsRoutes = require('./hearings');
const financeRoutes = require('./finance');
const backupRoutes = require('./backup');
const logsRoutes = require('./logs');

// Register routes
router.use('/users', usersRoutes);
router.use('/cases', casesRoutes);
router.use('/documents', documentsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/lawyers', lawyersRoutes);
router.use('/hearings', hearingsRoutes);
router.use('/finance', financeRoutes);
router.use('/backup', backupRoutes);
router.use('/logs', logsRoutes);

// Dashboard overview route
router.get('/dashboard', async (req, res) => {
  try {
    // Logic for admin dashboard overview
    // Get count of clients, cases, appointments, etc.
    res.status(200).json({
      message: 'Admin dashboard overview'
      // Add other dashboard data
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({ 
      error: 'ServerError',
      message: 'Failed to load admin dashboard'
    });
  }
});

module.exports = router;
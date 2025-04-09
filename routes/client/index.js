const express = require('express');
const router = express.Router();
const { isClient } = require('../../middlewares/roleMiddleware');

// Apply client middleware to all client routes
router.use(isClient);

// Import sub-routes
const profileRoutes = require('./profile');
const casesRoutes = require('./cases');
const documentsRoutes = require('./documents');
const appointmentsRoutes = require('./appointments');
const messagesRoutes = require('./messages');
const invoicesRoutes = require('./invoices');

// Register routes
router.use('/profile', profileRoutes);
router.use('/cases', casesRoutes);
router.use('/documents', documentsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/messages', messagesRoutes);
router.use('/invoices', invoicesRoutes);

// Dashboard overview route
router.get('/dashboard', async (req, res) => {
  try {
    // Logic for client dashboard overview
    res.status(200).json({
      message: 'Client dashboard overview'
      // Add other dashboard data specific to this client
    });
  } catch (error) {
    console.error('Error getting client dashboard:', error);
    res.status(500).json({ 
      error: 'ServerError',
      message: 'Failed to load client dashboard'
    });
  }
});

module.exports = router;
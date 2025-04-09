const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const appointmentController = require('../../controllers/appointmentController');

// Appointment routes
router.get('/', asyncHandler(appointmentController.getAppointments));
router.get('/:id', asyncHandler(appointmentController.getAppointment));
router.post('/', asyncHandler(appointmentController.createAppointment));
router.put('/:id', asyncHandler(appointmentController.updateAppointment));
router.delete('/:id', asyncHandler(appointmentController.deleteAppointment));

module.exports = router;
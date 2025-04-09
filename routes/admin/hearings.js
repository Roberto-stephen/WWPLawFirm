const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const hearingController = require('../../controllers/hearingController');

// Hearing routes
router.get('/', asyncHandler(hearingController.getHearings));
router.get('/:id', asyncHandler(hearingController.getHearing));
router.post('/', asyncHandler(hearingController.createHearing));
router.put('/:id', asyncHandler(hearingController.updateHearing));
router.delete('/:id', asyncHandler(hearingController.deleteHearing));

module.exports = router;
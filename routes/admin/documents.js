const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middlewares/errorMiddleware');
const documentController = require('../../controllers/documentController');
const upload = require('../../config/multer');

// Document routes
router.get('/', asyncHandler(documentController.getDocuments));
router.get('/:id', asyncHandler(documentController.getDocument));
router.post('/', upload.single('file'), asyncHandler(documentController.createDocument));
router.put('/:id', upload.single('file'), asyncHandler(documentController.updateDocument));
router.delete('/:id', asyncHandler(documentController.deleteDocument));

module.exports = router;
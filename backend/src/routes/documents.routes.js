// Rotas de documentos: definem os endpoints e delegam ao controller.

const express = require('express');

const documentsController = require('../controllers/documents.controller');

const router = express.Router();

router.post(
  '/upload',
  documentsController.uploadMiddleware,
  documentsController.uploadDocument
);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;

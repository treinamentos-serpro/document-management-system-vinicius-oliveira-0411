// Controller de documentos: trata entrada/saída HTTP e validação básica.
// O multer grava os arquivos no filesystem local (diskStorage) em storageDir.

const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const documentsService = require('../services/documents.service');
const { storageDir } = require('../config/storage');

// Remove separadores de caminho e caracteres inseguros do nome original.
function sanitizeFileName(fileName) {
  return path.basename(fileName).replace(/[^\w.\-]+/g, '_');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storageDir),
  filename: (req, file, cb) => {
    // Prefixo único evita colisões entre uploads com o mesmo nome original.
    cb(null, `${randomUUID()}-${sanitizeFileName(file.originalname)}`);
  },
});

const uploadMiddleware = multer({ storage }).single('file');

function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    const document = documentsService.createDocument({
      originalName: req.file.originalname,
      size: req.file.size,
      storedName: req.file.filename,
      owner: req.body.owner,
    });

    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function listDocuments(req, res, next) {
  try {
    return res.status(200).json(documentsService.listDocuments());
  } catch (error) {
    return next(error);
  }
}

function downloadDocument(req, res, next) {
  try {
    const documentFile = documentsService.getDocumentFile(req.params.id);

    if (!documentFile || !fs.existsSync(documentFile.filePath)) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    return res.download(documentFile.filePath, documentFile.originalName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadMiddleware,
  uploadDocument,
  listDocuments,
  downloadDocument,
};

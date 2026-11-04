// Regras de negócio dos documentos. Depende apenas do repositório e da
// configuração de armazenamento.

const path = require('node:path');
const { randomUUID } = require('node:crypto');

const documentsRepository = require('../repositories/documents.repository');
const { storageDir } = require('../config/storage');

const DEFAULT_OWNER = 'anonymous';

// Campos expostos na API (storedName é interno).
function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

function createDocument({ originalName, size, storedName, owner }) {
  const document = {
    id: randomUUID(),
    originalName,
    size,
    uploadedAt: new Date().toISOString(),
    owner: owner && owner.trim() ? owner.trim() : DEFAULT_OWNER,
    storedName,
  };

  documentsRepository.save(document);
  return toPublicDocument(document);
}

function listDocuments() {
  return documentsRepository.findAll().map(toPublicDocument);
}

// Retorna os dados necessários para o download ou null se não encontrado.
function getDocumentFile(id) {
  const document = documentsRepository.findById(id);
  if (!document) {
    return null;
  }

  return {
    originalName: document.originalName,
    filePath: path.join(storageDir, document.storedName),
  };
}

module.exports = { createDocument, listDocuments, getDocumentFile };

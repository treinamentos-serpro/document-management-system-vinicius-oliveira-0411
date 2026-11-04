// Repositório de documentos: metadados mantidos em memória nesta fase.
// Nenhuma outra camada acessa a coleção diretamente.

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = { save, findAll, findById };

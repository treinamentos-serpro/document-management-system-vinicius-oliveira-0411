// Configuração do diretório de armazenamento local (12-Factor: STORAGE_DIR).
// Restrição do projeto: arquivos são gravados apenas no filesystem local.

const fs = require('node:fs');
const path = require('node:path');

const storageDir =
  process.env.STORAGE_DIR || path.join(__dirname, '..', '..', 'storage');

// Garante que o diretório exista antes do primeiro upload.
fs.mkdirSync(storageDir, { recursive: true });

module.exports = { storageDir };

// Servidor backend do Document Management System.
//
// Camadas (Clean Architecture simples):
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const path = require('node:path');
const swaggerUi = require('swagger-ui-express');

const documentsRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../docs/openapi.yaml'));
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: '/openapi.yaml' } })
);

app.use(documentsRoutes);

// Tratamento central de erros: não vaza detalhes internos ao cliente.
app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;

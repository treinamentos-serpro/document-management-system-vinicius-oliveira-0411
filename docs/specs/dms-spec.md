# Especificação - Document Management System

> Especificação completa do Document Management System (DMS), gerada a partir
> do modelo em `spec-template.md`. Este documento orienta o desenvolvimento
> guiado por especificação (Spec Driven Development) nos próximos passos.
> **Nenhum código de backend ou frontend é implementado nesta etapa.**

## 1. Objetivo

Entregar um sistema web simples que permita a usuários enviar, listar e baixar
documentos, com arquivos gravados no filesystem local da aplicação e metadados
mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (um arquivo por requisição)
- Listagem de documentos com seus metadados
- Download de documentos pelo identificador
- Gestão simples por usuário (campo `owner` nos metadados, informado no upload)

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, GCS, etc.)
- Versionamento de documentos
- Autenticação/autorização real (o `owner` é apenas um identificador textual)
- Persistência dos metadados em banco de dados (ficam em memória nesta fase)
- Edição ou exclusão de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                                  |
| ----- | ------------------------------------------------------------------------------------------ |
| RF-01 | O usuário pode enviar um documento via `POST /upload` (multipart/form-data)                 |
| RF-02 | O usuário pode listar os documentos enviados via `GET /documents`                           |
| RF-03 | O usuário pode baixar um documento pelo identificador via `GET /documents/:id/download`     |
| RF-04 | O upload aceita um campo opcional `owner` para identificar o dono do documento              |
| RF-05 | O sistema gera um identificador único (`id`) para cada documento enviado                    |
| RF-06 | O download entrega o arquivo com o nome original (`Content-Disposition: attachment`)        |
| RF-07 | Requisições de download com `id` inexistente retornam `404` com mensagem em português       |
| RF-08 | Upload sem arquivo retorna `400` com mensagem de erro em português                          |
| RF-09 | O frontend oferece formulário de upload, lista de documentos e link de download por item    |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                   |
| ------ | ------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local em `backend/storage` via `multer` com `diskStorage`    |
| RNF-02 | Metadados mantidos em memória nesta fase (perdidos ao reiniciar o processo)                  |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT` e `STORAGE_DIR` (com defaults)    |
| RNF-04 | Backend em Node.js + Express (CommonJS); frontend em React + Vite (ESM)                      |
| RNF-05 | Backend segue Clean Architecture simples: `routes -> controllers -> services -> repositories`|
| RNF-06 | Testes do backend com o runner nativo do Node (`node:test`)                                  |
| RNF-07 | Frontend consome a API via `fetch` com prefixo `/api` (proxy do Vite para `localhost:3000`)  |
| RNF-08 | Mensagens ao usuário e comentários em português; símbolos de código em inglês                |
| RNF-09 | Erros tratados nos limites do sistema (entrada HTTP e leitura/escrita de arquivos)           |
| RNF-10 | Sem novas dependências além das já presentes nos `package.json` (express, multer, react)     |

## 5. Modelo de dados (metadados do documento)

Entidade `Document`, mantida em memória por um repositório dedicado:

| Campo        | Tipo   | Descrição                                                        |
| ------------ | ------ | ---------------------------------------------------------------- |
| id           | string | Identificador único do documento (UUID gerado via `node:crypto`) |
| originalName | string | Nome original do arquivo enviado                                 |
| size         | number | Tamanho em bytes                                                 |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                                   |
| owner        | string | Identificador do usuário dono (default: `"anonymous"`)           |

Campos internos (não expostos na API):

| Campo      | Tipo   | Descrição                                                          |
| ---------- | ------ | ------------------------------------------------------------------ |
| storedName | string | Nome do arquivo físico em `backend/storage` (ex.: `<id>-<nome>`)   |

Observações:

- O nome físico do arquivo em disco inclui o `id` para evitar colisões entre
  uploads com o mesmo nome original.
- A estrutura em memória é um array (ou `Map`) encapsulado no repositório;
  nenhuma outra camada acessa a coleção diretamente.

## 6. Contratos de API

Todas as rotas são servidas pelo backend na porta `3000` (configurável via
`PORT`). No frontend, as chamadas usam o prefixo `/api`, removido pelo proxy do
Vite (ex.: `fetch('/api/documents')` → `GET http://localhost:3000/documents`).

### POST /upload

Envia um documento.

- Entrada: `multipart/form-data`
  - `file` (obrigatório): o arquivo a ser enviado
  - `owner` (opcional): identificador textual do dono
- Saída de sucesso: `201 Created`

```json
{
  "id": "3f8a9c1e-5b2d-4e7f-9a0b-1c2d3e4f5a6b",
  "originalName": "relatorio.pdf",
  "size": 102400,
  "uploadedAt": "2026-11-04T19:00:00.000Z",
  "owner": "maria"
}
```

- Erros:
  - `400 Bad Request` — nenhum arquivo enviado:

```json
{ "error": "Nenhum arquivo foi enviado." }
```

### GET /documents

Lista os metadados de todos os documentos enviados.

- Saída de sucesso: `200 OK`

```json
[
  {
    "id": "3f8a9c1e-5b2d-4e7f-9a0b-1c2d3e4f5a6b",
    "originalName": "relatorio.pdf",
    "size": 102400,
    "uploadedAt": "2026-11-04T19:00:00.000Z",
    "owner": "maria"
  }
]
```

- Lista vazia retorna `200 OK` com `[]`.

### GET /documents/:id/download

Baixa o conteúdo binário de um documento.

- Entrada: `id` (parâmetro de rota)
- Saída de sucesso: `200 OK`
  - Corpo: conteúdo binário do arquivo
  - Cabeçalho: `Content-Disposition: attachment; filename="<originalName>"`
- Erros:
  - `404 Not Found` — documento não encontrado:

```json
{ "error": "Documento não encontrado." }
```

### GET /health (existente no seed)

- Saída: `200 OK` com `{ "status": "ok" }`. Deve continuar funcionando.

### Tratamento de erros transversal

- Erros inesperados (ex.: falha de leitura/escrita em disco) retornam
  `500 Internal Server Error` com `{ "error": "Erro interno do servidor." }`,
  sem vazar detalhes internos.

## 7. Decisões arquiteturais

- **Clean Architecture simples** no backend, em `backend/src`:
  - `routes/`: definem os endpoints e delegam para os controllers
  - `controllers/`: tratam entrada/saída HTTP e validação básica
  - `services/`: concentram as regras de negócio
  - `repositories/`: cuidam da persistência (arquivos locais + metadados em memória)
  - Fluxo de dependência: `routes -> controllers -> services -> repositories`;
    camadas internas não conhecem camadas externas.
- **Armazenamento estritamente local**: `multer` com `diskStorage` gravando em
  `backend/storage` (configurável via `STORAGE_DIR`); sem provedores externos.
- **Metadados em memória**: repositório encapsula um array/`Map`; a troca
  futura por banco de dados afeta apenas a camada `repositories/`.
- **Identificadores**: UUID gerado com `node:crypto` (`randomUUID`), sem
  dependências adicionais.
- **Frontend baseado em componentes**: `components/` (ex.: formulário de
  upload, lista de documentos), `pages/` e `services/` (cliente `fetch` para a
  API), com React Hooks e componentes funcionais.
- **Integração dev**: proxy do Vite já configurado (`/api` → `localhost:3000`).
- **Riscos conhecidos**:
  - Metadados em memória são perdidos ao reiniciar o backend (aceito nesta fase).
  - Sem limite de tamanho de upload configurado nesta fase (pode ser adicionado
    via `multer` se necessário).
  - `owner` não é autenticado; é apenas um rótulo informativo.

## 8. Plano de execução

> Etapas na ordem de implementação. **Nesta etapa apenas este documento é
> produzido; os arquivos de backend e frontend serão criados nos passos
> seguintes.**

1. **Especificação (este passo)**
   - Arquivos: `docs/specs/dms-spec.md`
   - Critério de aceite: documento revisado cobrindo requisitos, modelo de
     dados, contratos de API e plano de execução.

2. **Backend — camada de persistência**
   - Arquivos: `backend/src/repositories/documentRepository.js`
   - Conteúdo: coleção em memória de metadados; operações `save`, `findAll`,
     `findById`.
   - Critério de aceite: repositório isolado, sem conhecimento de HTTP.

3. **Backend — regras de negócio**
   - Arquivos: `backend/src/services/documentService.js`
   - Conteúdo: criação de metadados (id, datas, owner default), listagem e
     localização de documento para download.
   - Critério de aceite: serviço depende apenas do repositório.

4. **Backend — controllers e upload com multer**
   - Arquivos: `backend/src/controllers/documentController.js`
   - Conteúdo: validação de entrada (arquivo obrigatório), mapeamento para
     respostas HTTP (`201`, `200`, `400`, `404`), configuração do `multer`
     com `diskStorage` apontando para `backend/storage`.
   - Critério de aceite: erros respondidos em português conforme contratos.

5. **Backend — rotas e integração no app**
   - Arquivos: `backend/src/routes/documentRoutes.js`, ajuste em
     `backend/src/app.js`
   - Conteúdo: registro de `POST /upload`, `GET /documents`,
     `GET /documents/:id/download`; manter `GET /health`.
   - Critério de aceite: todas as rotas acessíveis; `app` continua exportado
     para os testes.

6. **Backend — testes**
   - Arquivos: `backend/test/documents.test.js` (e manutenção de
     `backend/test/app.test.js`)
   - Conteúdo: testes com `node:test` cobrindo upload, listagem, download e
     casos de erro (`400`, `404`).
   - Critério de aceite: `npm test` verde no diretório `backend`.

7. **Frontend — serviço de API**
   - Arquivos: `frontend/src/services/documentsApi.js`
   - Conteúdo: funções `uploadDocument`, `listDocuments` e montagem da URL de
     download, usando `fetch` com prefixo `/api`.
   - Critério de aceite: nenhuma URL absoluta do backend no código.

8. **Frontend — componentes e página**
   - Arquivos: `frontend/src/components/UploadForm.jsx`,
     `frontend/src/components/DocumentList.jsx`,
     `frontend/src/pages/DocumentsPage.jsx`, ajuste em `frontend/src/App.jsx`
   - Conteúdo: formulário de upload (arquivo + owner), lista com nome,
     tamanho, data, dono e link de download; mensagens em português.
   - Critério de aceite: fluxo completo upload → listagem → download
     funcionando via proxy do Vite.

9. **Integração e revisão final**
   - Conteúdo: teste manual ponta a ponta (backend `npm run dev` +
     frontend `npm run dev`), revisão de aderência à spec e às convenções.
   - Critério de aceite: RF-01 a RF-09 verificados; nenhuma regressão em
     `GET /health`.

// Cliente da API de documentos. Toda comunicação com o backend passa pelo
// prefixo /api, redirecionado pelo proxy do Vite durante o desenvolvimento.

const API_PREFIX = '/api';

async function parseErrorMessage(response, fallbackMessage) {
  try {
    const body = await response.json();
    return body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);
  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Falha ao enviar o documento.'));
  }

  return response.json();
}

export async function listDocuments() {
  const response = await fetch(`${API_PREFIX}/documents`);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Falha ao listar os documentos.'));
  }

  return response.json();
}

export function getDownloadUrl(documentId) {
  return `${API_PREFIX}/documents/${documentId}/download`;
}

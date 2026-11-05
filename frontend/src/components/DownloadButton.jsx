import { getDownloadUrl } from '../services/documentsApi.js';

// Link de download de um documento, servido diretamente pelo backend.
export default function DownloadButton({ documentId, originalName }) {
  return (
    <a href={getDownloadUrl(documentId)} download={originalName}>
      Baixar
    </a>
  );
}

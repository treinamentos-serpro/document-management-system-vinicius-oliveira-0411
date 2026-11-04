import DownloadButton from './DownloadButton.jsx';

// Formata o tamanho em bytes de forma legível.
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Formata a data ISO 8601 para o padrão local.
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

// Tabela com os metadados dos documentos e link de download por item.
export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
          <th style={{ padding: '0.5rem' }}>Nome</th>
          <th style={{ padding: '0.5rem' }}>Tamanho</th>
          <th style={{ padding: '0.5rem' }}>Enviado em</th>
          <th style={{ padding: '0.5rem' }}>Dono</th>
          <th style={{ padding: '0.5rem' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '0.5rem' }}>{doc.originalName}</td>
            <td style={{ padding: '0.5rem' }}>{formatSize(doc.size)}</td>
            <td style={{ padding: '0.5rem' }}>{formatDate(doc.uploadedAt)}</td>
            <td style={{ padding: '0.5rem' }}>{doc.owner}</td>
            <td style={{ padding: '0.5rem' }}>
              <DownloadButton documentId={doc.id} originalName={doc.originalName} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

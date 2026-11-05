import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentsApi.js';

// Componente raiz: orquestra upload, listagem e download de documentos.
export default function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setDocuments(await listDocuments());
    } catch (listError) {
      setError(listError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <UploadComponent onUploaded={refreshDocuments} />

      <section style={{ marginTop: '2rem' }}>
        <h2>Documentos</h2>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {loading ? <p>Carregando documentos...</p> : <DocumentList documents={documents} />}
      </section>
    </main>
  );
}

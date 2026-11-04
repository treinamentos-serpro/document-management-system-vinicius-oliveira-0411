import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi.js';

// Formulário de upload: envia um arquivo (obrigatório) e um dono (opcional).
export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await uploadDocument(file, owner.trim());
      setFile(null);
      event.target.reset();
      onUploaded?.();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', maxWidth: '24rem' }}>
      <h2>Enviar documento</h2>

      <label>
        Arquivo:{' '}
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0] ?? null)}
        />
      </label>

      <label>
        Dono (opcional):{' '}
        <input
          type="text"
          value={owner}
          placeholder="ex.: maria"
          onChange={(event) => setOwner(event.target.value)}
        />
      </label>

      <button type="submit" disabled={sending}>
        {sending ? 'Enviando...' : 'Enviar'}
      </button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}

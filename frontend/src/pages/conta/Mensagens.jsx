import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import useTitulo from '../../hooks/useTitulo';

export default function Mensagens() {
  useTitulo('Mensagens');
  const [pasta, setPasta] = useState('Caixa de entrada');
  return (
    <section className="messages-page">
      <aside className="message-sidebar">
        <div>
          <h1>Mensagens</h1>
          <span className="preview-badge">Prévia</span>
        </div>
        <label>
          <span className="sr-only">Pasta de mensagens</span>
          <select value={pasta} onChange={(e) => setPasta(e.target.value)}>
            <option>Caixa de entrada</option>
            <option>Arquivadas</option>
            <option>Spam</option>
          </select>
        </label>
      </aside>
      <div className="message-content">
        <div className="empty-icon">
          <MessageSquare size={64} strokeWidth={1.5} />
        </div>
        <h2>
          {pasta === 'Caixa de entrada'
            ? 'Bem-vindo às Mensagens'
            : `Nenhuma mensagem em ${pasta.toLowerCase()}`}
        </h2>
        <p>Quando uma ONG entrar em contato com você, as conversas aparecerão aqui.</p>
        <span className="account-demo-note">
          Mensagens ainda não conectadas nesta demonstração.
        </span>
      </div>
    </section>
  );
}

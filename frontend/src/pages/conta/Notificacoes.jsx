import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTitulo from '../../hooks/useTitulo';

export default function Notificacoes() {
  useTitulo('Notificações');
  const navegar = useNavigate();
  return (
    <section className="notifications-page">
      <div className="empty-icon">
        <Bell size={62} strokeWidth={1.5} />
      </div>
      <h1>
        Não há novas notificações.
        <br />
        Verifique mais tarde.
      </h1>
      <p>
        Aqui você encontrará novidades sobre suas candidaturas e informações para ajudar na sua
        jornada de voluntariado.
      </p>
      <button className="primary-button" onClick={() => navegar('/oportunidades')}>
        Encontrar vagas
      </button>
      <span className="account-demo-note">
        Demonstração local · notificações ainda não conectadas.
      </span>
    </section>
  );
}

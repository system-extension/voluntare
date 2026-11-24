import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTitulo from '../hooks/useTitulo';

export default function NaoEncontrada() {
  useTitulo('Página não encontrada');
  const navegar = useNavigate();
  return (
    <section className="results-container">
      <div className="empty-state">
        <Search size={36} />
        <h2>Página não encontrada</h2>
        <p>O endereço pode ter mudado. Que tal procurar uma oportunidade?</p>
        <button className="primary-button" onClick={() => navegar('/oportunidades')}>
          Ver oportunidades
        </button>
      </div>
    </section>
  );
}

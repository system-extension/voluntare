import { useNavigate } from 'react-router-dom';
import useModal from '../../hooks/useModal';

export default function Rodape() {
  const { abrir } = useModal();
  const navegar = useNavigate();
  const info = (titulo) => abrir('info', { titulo });

  return (
    <footer className="site-footer">
      <nav aria-label="Links úteis">
        <button onClick={() => info('Guia de voluntariado')}>Guia de voluntariado</button>
        <button onClick={() => navegar('/oportunidades')}>Pesquisar vagas</button>
        <button onClick={() => info('Causas')}>Causas</button>
        <button onClick={() => info('Voluntare Eventos')}>Voluntare Eventos</button>
        <button onClick={() => info('País e idioma')}>Países</button>
        <button onClick={() => info('Sobre o Voluntare')}>Sobre o Voluntare</button>
        <button onClick={() => info('Ajuda')}>Ajuda</button>
      </nav>
      <nav aria-label="Informações legais">
        <span>© {new Date().getFullYear()} Voluntare</span>
        <button onClick={() => info('Acessibilidade no Voluntare')}>
          Acessibilidade no Voluntare
        </button>
        <button onClick={() => info('Privacidade')}>Centro de privacidade e preferências</button>
        <button onClick={() => info('Termos')}>Termos</button>
      </nav>
    </footer>
  );
}

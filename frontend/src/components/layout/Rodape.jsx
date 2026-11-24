import { Link } from 'react-router-dom';
import useModal from '../../hooks/useModal';

/**
 * Rodapé enxuto: só links que levam a uma tela de verdade ou a um texto que vale para o sistema
 * real (ajuda, privacidade, termos e acessibilidade).
 */
export default function Rodape() {
  const { abrir } = useModal();
  const info = (titulo) => abrir('info', { titulo });

  return (
    <footer className="site-footer">
      <nav aria-label="Links úteis">
        <Link to="/oportunidades">Pesquisar vagas</Link>
        <Link to="/para-organizacoes">Para organizações</Link>
        <button onClick={() => info('Ajuda')}>Ajuda</button>
        <button onClick={() => info('Privacidade')}>Privacidade</button>
        <button onClick={() => info('Termos de uso')}>Termos de uso</button>
        <button onClick={() => info('Acessibilidade')}>Acessibilidade</button>
      </nav>
      <p>© {new Date().getFullYear()} Voluntare · Projeto da Fábrica de Software · UNIVILLE</p>
    </footer>
  );
}

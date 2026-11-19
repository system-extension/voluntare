import { Link, Outlet } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import './acesso.css';

/**
 * Layout enxuto das telas de acesso: só a marca e um cartão, sem menus,
 * para a pessoa focar em entrar ou criar a conta.
 */
export default function LayoutAcesso() {
  return (
    <div className="acesso">
      <main id="main" className="acesso-conteudo">
        <Link className="brand-link acesso-marca" to="/" aria-label="Voluntare, página inicial">
          <Logo tamanho="medio" />
        </Link>
        <Outlet />
      </main>
      <footer className="acesso-rodape">© {new Date().getFullYear()} Voluntare</footer>
    </div>
  );
}

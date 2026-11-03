import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Cabecalho from './Cabecalho';
import Rodape from './Rodape';
import './layout.css';

/** Classe do <main> por área (mesmos estilos do layout anterior). */
function classeDoConteudo(pathname) {
  if (pathname === '/') return 'home-main';
  if (pathname.startsWith('/conta')) return 'account-main';
  return 'results-main';
}

export default function LayoutPrincipal() {
  const { pathname } = useLocation();

  // Ao trocar de página, volta ao topo.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Ir para o conteúdo principal
      </a>
      <Cabecalho />
      <main id="main" className={classeDoConteudo(pathname)}>
        <Outlet />
      </main>
      <Rodape />
    </>
  );
}

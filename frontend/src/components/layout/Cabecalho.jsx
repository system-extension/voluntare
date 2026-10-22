import { useState } from 'react';
import { Bell, Bookmark, Menu, MessageSquare, UserRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import useModal from '../../hooks/useModal';
import Logo from '../ui/Logo';

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const { abrir } = useModal();
  const { demonstracao } = useConta();

  const paginaInicialAtiva = pathname === '/' || pathname.startsWith('/oportunidades');
  const irPara = (caminho) => {
    setMenuAberto(false);
    navegar(caminho);
  };
  const info = (titulo) => {
    setMenuAberto(false);
    abrir('info', { titulo });
  };

  return (
    <>
      <header className="site-header">
        <Link className="brand-link" to="/" aria-label="Voluntare, página inicial">
          <Logo />
        </Link>
        <nav className="primary-nav" aria-label="Navegação principal">
          <Link to="/" className={paginaInicialAtiva ? 'active' : ''}>
            Página inicial
          </Link>
          <button onClick={() => info('Conheça as organizações')}>Avaliações de ONGs</button>
          <button onClick={() => irPara('/oportunidades')}>Causas e oportunidades</button>
        </nav>
        <nav className="account-nav" aria-label="Sua conta">
          {demonstracao ? (
            <FerramentasConta pathname={pathname} irPara={irPara} />
          ) : (
            <>
              <button className="sign-in" onClick={() => abrir('conta')}>
                Acessar
              </button>
              <button className="country" onClick={() => info('País e idioma')}>
                <span>BR</span> País e idioma
              </button>
            </>
          )}
          <button className="employers" onClick={() => irPara('/organizacao')}>
            ONGs/Anunciar vagas
          </button>
        </nav>
        <button
          className="icon-button mobile-menu-button"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X /> : <Menu />}
        </button>
      </header>
      {menuAberto && (
        <nav className="mobile-menu" aria-label="Menu móvel">
          <button onClick={() => irPara('/')}>Página inicial</button>
          <button onClick={() => info('Conheça as organizações')}>Avaliações de ONGs</button>
          <button onClick={() => irPara('/oportunidades')}>Causas e oportunidades</button>
          <button onClick={() => irPara('/organizacao')}>ONGs/Anunciar vagas</button>
        </nav>
      )}
    </>
  );
}

function FerramentasConta({ pathname, irPara }) {
  const [menuConta, setMenuConta] = useState(false);
  const { sair } = useConta();
  const ativo = (...caminhos) => (caminhos.includes(pathname) ? 'active' : '');
  const abrirTela = (caminho) => {
    setMenuConta(false);
    irPara(caminho);
  };

  return (
    <div className="account-tools">
      <button
        className={`account-tool ${ativo('/conta/minhas-vagas')}`}
        aria-label="Minhas vagas"
        title="Minhas vagas"
        onClick={() => abrirTela('/conta/minhas-vagas')}
      >
        <Bookmark size={21} fill="currentColor" />
      </button>
      <button
        className={`account-tool ${ativo('/conta/mensagens')}`}
        aria-label="Mensagens"
        title="Mensagens"
        onClick={() => abrirTela('/conta/mensagens')}
      >
        <MessageSquare size={21} fill="currentColor" />
      </button>
      <button
        className={`account-tool ${ativo('/conta/notificacoes')}`}
        aria-label="Notificações"
        title="Notificações"
        onClick={() => abrirTela('/conta/notificacoes')}
      >
        <Bell size={21} fill="currentColor" />
      </button>
      <div className="account-menu-wrap">
        <button
          className={`account-tool ${ativo('/conta/perfil', '/conta/preferencias')}`}
          aria-label="Conta"
          aria-expanded={menuConta}
          title="Conta"
          onClick={() => setMenuConta(!menuConta)}
        >
          <UserRound size={21} fill="currentColor" />
        </button>
        {menuConta && (
          <>
            <button
              className="menu-dismiss"
              aria-label="Fechar menu da conta"
              onClick={() => setMenuConta(false)}
            />
            <div
              className="account-dropdown"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMenuConta(false);
              }}
            >
              <strong>Conta de demonstração</strong>
              <button onClick={() => abrirTela('/conta/perfil')}>Perfil</button>
              <button onClick={() => abrirTela('/conta/preferencias')}>Preferências</button>
              <button onClick={() => abrirTela('/conta/minhas-vagas')}>Minhas vagas</button>
              <button
                onClick={() => {
                  sair();
                  abrirTela('/');
                }}
              >
                Sair da demonstração
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Bell, Bookmark, Building2, Menu, MessageSquare, UserRound, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import useModal from '../../hooks/useModal';
import { ROTULO_PAPEL, ehDaOrganizacao } from '../../utils/papeis';
import Logo from '../ui/Logo';

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const navegar = useNavigate();
  const { abrir } = useModal();
  const { usuario, sair } = useConta();

  const paginaInicialAtiva = pathname === '/' || pathname.startsWith('/oportunidades');
  const irPara = (caminho) => {
    setMenuAberto(false);
    navegar(caminho);
  };
  // Guarda a tela atual para voltar a ela depois do login.
  const irParaLogin = () => {
    setMenuAberto(false);
    navegar('/entrar', { state: { de: location } });
  };
  const encerrarSessao = () => {
    setMenuAberto(false);
    sair();
    navegar('/');
  };
  // Gestor/coordenador vai para a sua área; os demais conhecem a proposta antes de cadastrar.
  const areaDaOng = ehDaOrganizacao(usuario) ? '/organizacao' : '/para-organizacoes';
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
          {usuario ? (
            <FerramentasConta
              usuario={usuario}
              pathname={pathname}
              irPara={irPara}
              aoSair={encerrarSessao}
            />
          ) : (
            <>
              <button className="sign-in" onClick={irParaLogin}>
                Acessar
              </button>
              <button className="country" onClick={() => info('País e idioma')}>
                <span>BR</span> País e idioma
              </button>
            </>
          )}
          <button className="employers" onClick={() => irPara(areaDaOng)}>
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
          <button onClick={() => irPara(areaDaOng)}>ONGs/Anunciar vagas</button>
          {usuario ? (
            <button onClick={encerrarSessao}>Sair</button>
          ) : (
            <button onClick={irParaLogin}>Acessar</button>
          )}
        </nav>
      )}
    </>
  );
}

/** Ícones da conta (voluntário) e menu com nome, papel e "Sair" (todos os papéis). */
function FerramentasConta({ usuario, pathname, irPara, aoSair }) {
  const [menuConta, setMenuConta] = useState(false);
  const daOrganizacao = ehDaOrganizacao(usuario);
  const ativo = (...caminhos) => (caminhos.includes(pathname) ? 'active' : '');
  const abrirTela = (caminho) => {
    setMenuConta(false);
    irPara(caminho);
  };

  return (
    <div className="account-tools">
      {daOrganizacao ? (
        <button
          className={`account-tool ${pathname.startsWith('/organizacao') ? 'active' : ''}`}
          aria-label="Área da organização"
          title="Área da organização"
          onClick={() => abrirTela('/organizacao')}
        >
          <Building2 size={21} />
        </button>
      ) : (
        <>
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
        </>
      )}
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
              <strong>{usuario.email}</strong>
              <span className="account-dropdown-papel">
                {ROTULO_PAPEL[usuario.papel]}
                {usuario.organizacao && ` · ${usuario.organizacao.nome}`}
              </span>
              {daOrganizacao ? (
                <button onClick={() => abrirTela('/organizacao')}>Área da organização</button>
              ) : (
                <>
                  <button onClick={() => abrirTela('/conta/perfil')}>Perfil</button>
                  <button onClick={() => abrirTela('/conta/minhas-vagas')}>Minhas vagas</button>
                </>
              )}
              <button onClick={aoSair}>Sair</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Globe2, MapPin, Menu, MessageSquare, Search, UserRound, X } from 'lucide-react';
import { jobs, normalize } from './data.js';
import AccountPages from './AccountPages.jsx';
import OrganizationPage from './OrganizationPage.jsx';
import { ORGANIZATION_JOBS_KEY, parseOrganizationJobs } from './organizationJobs.js';

const PAGE_SIZE = 15;
const initialParams = new URLSearchParams(window.location.search);
const initialPage = Math.max(1, Number(initialParams.get('page')) || 1);
const causes = ['Todas as causas', 'Educação', 'Meio ambiente', 'Assistência social', 'Animais', 'Comunicação'];
const accountViews = ['profile', 'preferences', 'myjobs', 'messages', 'notifications'];
const screenViews = [...accountViews, 'organization'];
const initialView = screenViews.includes(initialParams.get('screen')) ? initialParams.get('screen') : initialParams.has('q') ? 'results' : 'home';

function Logo({ large = false }) {
  return <span className={`wordmark ${large ? 'wordmark-large' : ''}`}>voluntare<span className="wordmark-dot">.</span></span>;
}

function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Fechar"><X size={22} /></button>
      <Logo />
      <h2>{title}</h2>
      {children}
    </div>
  </dialog>;
}

export default function App() {
  const [organizationJobs, setOrganizationJobs] = useState(() => {
    try { return parseOrganizationJobs(localStorage.getItem(ORGANIZATION_JOBS_KEY)); } catch { return []; }
  });
  const [storageError, setStorageError] = useState('');
  const allJobs = useMemo(() => [...organizationJobs.filter(job => job.status === 'active'), ...jobs], [organizationJobs]);
  function saveOrganizationJob(job) {
    const next = organizationJobs.some(item => item.id === job.id) ? organizationJobs.map(item => item.id === job.id ? job : item) : [job, ...organizationJobs];
    try { localStorage.setItem(ORGANIZATION_JOBS_KEY, JSON.stringify(next)); }
    catch { setStorageError('Não foi possível salvar no navegador. Libere espaço ou permita o armazenamento e tente novamente.'); return false; }
    setStorageError(''); setOrganizationJobs(next); return true;
  }
  const [query, setQuery] = useState(initialParams.get('q') || '');
  const [location, setLocation] = useState(initialParams.get('l') || '');
  const [search, setSearch] = useState({ query, location });
  const [view, setView] = useState(initialView);
  const [demoAccount, setDemoAccount] = useState(accountViews.includes(initialView));
  const [accountMenu, setAccountMenu] = useState(false);
  const [profile, setProfile] = useState({ name: 'Pessoa Voluntária', city: 'Sua cidade, Brasil', email: 'voluntario@example.com', about: '' });
  const [preferences, setPreferences] = useState({ visible: true, ready: false, values: { Causas: 'Educação', 'Horário disponível': 'Fins de semana', 'Formato da vaga': 'Remoto', 'Tempo de dedicação': '2 horas por semana', Deslocamento: 'Até 10 km' } });
  const [cause, setCause] = useState(initialParams.get('cause') || causes[0]);
  const [mode, setMode] = useState(initialParams.get('mode') || 'Todos os formatos');
  const [page, setPage] = useState(initialPage);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(() => {
    try { const value = JSON.parse(localStorage.getItem('voluntare-saved') || '[]'); return Array.isArray(value) ? value.filter(Number.isInteger) : []; } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem('voluntare-saved', JSON.stringify(saved)); } catch { /* A interface continua funcionando sem armazenamento. */ } }, [saved]);
  useEffect(() => {
    const titles = { organization: 'ONGs / Anunciar vagas', home: 'Encontre sua próxima oportunidade', results: 'Vagas de voluntariado', profile: 'Meu perfil', preferences: 'Preferências', myjobs: 'Minhas vagas', messages: 'Mensagens', notifications: 'Notificações' };
    document.title = `${titles[view]} | Voluntare`;
  }, [view]);
  useEffect(() => {
    if (mobileDetail && window.matchMedia('(max-width: 640px)').matches) {
      document.querySelector('.job-detail')?.scrollIntoView({ block: 'start' });
      document.querySelector('.back-to-results')?.focus({ preventScroll: true });
    }
  }, [mobileDetail, selectedId]);
  useEffect(() => {
    const popstate = () => {
      const params = new URLSearchParams(window.location.search);
      const nextQuery = params.get('q') || '', nextLocation = params.get('l') || '';
      setQuery(nextQuery); setLocation(nextLocation); setSearch({ query: nextQuery, location: nextLocation });
      const nextView = screenViews.includes(params.get('screen')) ? params.get('screen') : params.has('q') ? 'results' : 'home';
      setView(nextView); if (accountViews.includes(nextView)) setDemoAccount(true); setPage(Math.max(1, Number(params.get('page')) || 1));
      setCause(params.get('cause') || causes[0]); setMode(params.get('mode') || 'Todos os formatos');
      setSelectedId(null); setMobileDetail(false);
    };
    window.addEventListener('popstate', popstate);
    return () => window.removeEventListener('popstate', popstate);
  }, []);

  const filtered = useMemo(() => allJobs.filter(job =>
    normalize(`${job.title} ${job.organization} ${job.cause} ${job.description}`).includes(normalize(search.query)) &&
    normalize(job.location).includes(normalize(search.location)) &&
    (cause === causes[0] || job.cause === cause) && (mode === 'Todos os formatos' || job.mode === mode)
  ), [search, cause, mode, allJobs]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleJobs = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = visibleJobs.find(job => job.id === selectedId) || visibleJobs[0];

  function updateUrl(values) {
    const params = new URLSearchParams({ q: values.query ?? search.query, l: values.location ?? search.location, page: String(values.page ?? 1) });
    const nextCause = values.cause ?? cause, nextMode = values.mode ?? mode;
    if (nextCause !== causes[0]) params.set('cause', nextCause);
    if (nextMode !== 'Todos os formatos') params.set('mode', nextMode);
    window.history.pushState({}, '', `?${params}`);
  }
  function runSearch(nextQuery = query, nextLocation = location) {
    setQuery(nextQuery); setLocation(nextLocation); setSearch({ query: nextQuery, location: nextLocation });
    setView('results'); setPage(1); setSelectedId(null); setMobileDetail(false); setMenuOpen(false);
    updateUrl({ query: nextQuery, location: nextLocation, page: 1 });
    window.scrollTo({ top: 0 });
  }
  function home() {
    setView('home'); setQuery(''); setLocation(''); setCause(causes[0]); setMode('Todos os formatos'); setMenuOpen(false);
    window.history.pushState({}, '', window.location.pathname); window.scrollTo({ top: 0 });
  }
  function openScreen(screen) {
    setView(screen); if (accountViews.includes(screen)) setDemoAccount(true); setModal(null); setMenuOpen(false); setAccountMenu(false);
    window.history.pushState({}, '', `?screen=${screen}`); window.scrollTo({ top: 0 });
  }
  function openSavedJob(job) {
    setCause(causes[0]); setMode('Todos os formatos'); setQuery(job.title); setLocation(''); setSearch({ query: job.title, location: '' }); setPage(1); setSelectedId(job.id); setMobileDetail(true); setView('results');
    updateUrl({ query: job.title, location: '', cause: causes[0], mode: 'Todos os formatos' }); window.scrollTo({ top: 0 });
  }
  function changeFilter(type, value) {
    (type === 'cause' ? setCause : setMode)(value); setPage(1); setSelectedId(null); updateUrl({ [type]: value });
  }
  function changePage(nextPage) {
    setPage(nextPage); setSelectedId(null); setMobileDetail(false); updateUrl({ page: nextPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function toggleSave(id) { setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  function info(title) { setModal({ type: 'info', title }); setMenuOpen(false); }

  return <>
    <a className="skip-link" href="#main">Ir para o conteúdo principal</a>
    <header className="site-header">
      <a className="brand-link" href="/" onClick={e => { e.preventDefault(); home(); }} aria-label="Voluntare, página inicial"><Logo /></a>
      <nav className="primary-nav" aria-label="Navegação principal">
        <a href="/" className={view === 'home' || view === 'results' ? 'active' : ''} onClick={e => { e.preventDefault(); home(); }}>Página inicial</a>
        <button onClick={() => info('Conheça as organizações')}>Avaliações de ONGs</button>
        <button onClick={() => runSearch('', '')}>Causas e oportunidades</button>
      </nav>
      <nav className="account-nav" aria-label="Sua conta">
        {demoAccount ? <div className="account-tools">
          <button className={`account-tool ${view === 'myjobs' ? 'active' : ''}`} aria-label="Minhas vagas" title="Minhas vagas" onClick={() => openScreen('myjobs')}><Bookmark size={21} fill="currentColor" /></button>
          <button className={`account-tool ${view === 'messages' ? 'active' : ''}`} aria-label="Mensagens" title="Mensagens" onClick={() => openScreen('messages')}><MessageSquare size={21} fill="currentColor" /></button>
          <button className={`account-tool ${view === 'notifications' ? 'active' : ''}`} aria-label="Notificações" title="Notificações" onClick={() => openScreen('notifications')}><Bell size={21} fill="currentColor" /></button>
          <div className="account-menu-wrap"><button className={`account-tool ${view === 'profile' || view === 'preferences' ? 'active' : ''}`} aria-label="Conta" aria-expanded={accountMenu} title="Conta" onClick={() => setAccountMenu(!accountMenu)}><UserRound size={21} fill="currentColor" /></button>
          {accountMenu && <><button className="menu-dismiss" aria-label="Fechar menu da conta" onClick={() => setAccountMenu(false)} /><div className="account-dropdown" onKeyDown={event => { if (event.key === 'Escape') setAccountMenu(false); }}><strong>Conta de demonstração</strong><button onClick={() => openScreen('profile')}>Perfil</button><button onClick={() => openScreen('preferences')}>Preferências</button><button onClick={() => openScreen('myjobs')}>Minhas vagas</button><button onClick={() => { setDemoAccount(false); setAccountMenu(false); home(); }}>Sair da demonstração</button></div></>}
          </div>
        </div> : <><button className="sign-in" onClick={() => setModal({ type: 'account', title: 'Seu próximo passo começa aqui' })}>Acessar</button><button className="country" onClick={() => info('País e idioma')}><span>BR</span> País e idioma</button></>}
        <button className="employers" onClick={() => openScreen('organization')}>ONGs/Anunciar vagas</button>
      </nav>
      <button className="icon-button mobile-menu-button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    {menuOpen && <nav className="mobile-menu" aria-label="Menu móvel"><button onClick={home}>Página inicial</button><button onClick={() => info('Conheça as organizações')}>Avaliações de ONGs</button><button onClick={() => runSearch('', '')}>Causas e oportunidades</button><button onClick={() => openScreen('organization')}>ONGs/Anunciar vagas</button></nav>}

    <main id="main" className={accountViews.includes(view) ? 'account-main' : view === 'home' ? 'home-main' : 'results-main'}>
      {view === 'organization' ? <OrganizationPage jobs={organizationJobs} onSave={saveOrganizationJob} storageError={storageError} onOpenJob={openSavedJob} /> : accountViews.includes(view) ? <AccountPages jobs={allJobs} view={view} saved={saved} toggleSave={toggleSave} onSearch={() => runSearch('', '')} onOpenJob={openSavedJob} profile={profile} setProfile={setProfile} preferences={preferences} setPreferences={setPreferences} /> : <>
      <div className="search-wrap">
        <form className="search-form" role="search" onSubmit={e => { e.preventDefault(); runSearch(); }}>
          <label className="search-field"><Search size={22} aria-hidden="true" /><span className="sr-only">Atividade, palavras-chave ou ONG</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Atividade, palavras-chave ou ONG" /></label>
          <label className="search-field location-field"><MapPin size={22} aria-hidden="true" /><span className="sr-only">Cidade, estado, região ou remoto</span><input value={location} onChange={e => setLocation(e.target.value)} placeholder={'Cidade, estado, região ou “remoto”'} /></label>
          <button className="primary-button search-button" type="submit">Achar vagas</button>
        </form>
      </div>

      {view === 'home' ? <>
        <section className="welcome" aria-labelledby="welcome-title">
          <Logo large />
          <h1 id="welcome-title">Sua próxima vaga começa aqui</h1>
          <p>Encontre uma oportunidade de voluntariado e faça parte de uma causa.</p>
          <button className="primary-button start-button" onClick={() => runSearch('', '')}>Começar <ArrowRight size={23} /></button>
        </section>
        <section className="trending" aria-label="Explore oportunidades">
          <details><summary>O que está em alta no Voluntare <ChevronDown size={19} /></summary>
            <div className="trending-grid">
              <div><h2>Buscas em alta</h2>{['Educação', 'Meio ambiente', 'Animais', 'Assistência social'].map(term => <button key={term} onClick={() => runSearch(term, '')}>{term} <ChevronRight size={14} /></button>)}</div>
              <div><h2>Oportunidades em alta</h2>{['Apoio escolar', 'Mentoria', 'Comunicação', 'Doações'].map(term => <button key={term} onClick={() => runSearch(term, '')}>{term} <ChevronRight size={14} /></button>)}</div>
              <div><h2>Locais em alta</h2>{['Joinville', 'São Paulo', 'Curitiba', 'Remoto'].map(term => <button key={term} onClick={() => runSearch('', term)}>{term} <ChevronRight size={14} /></button>)}</div>
            </div>
          </details>
        </section>
      </> : <section className="results-container" aria-label="Oportunidades de voluntariado">
        <div className="filters">
          <label><span>Qual causa você busca?</span><select value={cause} onChange={e => changeFilter('cause', e.target.value)}>{causes.map(item => <option key={item}>{item}</option>)}</select></label>
          <label><span>Formato</span><select value={mode} onChange={e => changeFilter('mode', e.target.value)}>{['Todos os formatos', 'Presencial', 'Remoto', 'Híbrido'].map(item => <option key={item}>{item}</option>)}</select></label>
          {(cause !== causes[0] || mode !== 'Todos os formatos') && <button className="text-button clear-filters" onClick={() => { setCause(causes[0]); setMode('Todos os formatos'); setPage(1); updateUrl({ cause: causes[0], mode: 'Todos os formatos' }); }}>Limpar filtros</button>}
        </div>
        <div className="results-heading"><h1>{search.query ? `Vagas de ${search.query}` : 'Vagas de voluntariado'}{search.location && ` em ${search.location}`}</h1><p>Oportunidades de demonstração</p></div>
        <div className="results-layout">
          <div className={`job-list ${mobileDetail ? 'mobile-hidden' : ''}`}>
            <div className="results-count"><span>{filtered.length} vagas encontradas</span><span>Página {currentPage} de {pageCount}</span></div>
            {visibleJobs.map(job => <article className={`job-card ${selected?.id === job.id ? 'selected' : ''}`} key={job.id}>
              <button className="job-select" aria-pressed={selected?.id === job.id} onClick={() => { setSelectedId(job.id); setMobileDetail(true); }} aria-label={`Ver detalhes: ${job.title}`}>
                <span className="job-title">{job.title}</span><span className="organization">{job.organization}</span><span className="job-location">{job.location}</span>
                <span className="tags"><span>{job.mode}</span><span>{job.hours}</span></span>
                <span className="easy-apply"><ArrowRight size={15} /> Candidate-se pelo Voluntare</span>
                <span className="job-summary">{job.description}</span><span className="published">{job.published}</span>
              </button>
              <button className={`icon-button save-card ${saved.includes(job.id) ? 'saved' : ''}`} aria-label={saved.includes(job.id) ? `Remover dos salvos: ${job.title}` : `Salvar: ${job.title}`} aria-pressed={saved.includes(job.id)} onClick={() => toggleSave(job.id)}><Bookmark size={21} fill={saved.includes(job.id) ? 'currentColor' : 'none'} /></button>
            </article>)}
            {!filtered.length && <div className="empty-state"><Search size={36} /><h2>Nenhuma vaga encontrada</h2><p>Tente outra atividade, cidade ou causa.</p><button className="primary-button" onClick={() => { setCause(causes[0]); setMode('Todos os formatos'); setQuery(''); setLocation(''); setSearch({ query: '', location: '' }); setPage(1); updateUrl({ query: '', location: '', cause: causes[0], mode: 'Todos os formatos' }); }}>Ver todas as vagas</button></div>}
            {filtered.length > 0 && <nav className="pagination" aria-label="Páginas de vagas">
              {currentPage > 1 && <button className="page-button" onClick={() => changePage(currentPage - 1)} aria-label="Página anterior"><ChevronLeft size={20} /></button>}
              {Array.from({ length: pageCount }, (_, index) => <button key={index} className={`page-button ${currentPage === index + 1 ? 'current' : ''}`} aria-current={currentPage === index + 1 ? 'page' : undefined} aria-label={`Página ${index + 1}`} onClick={() => changePage(index + 1)}>{index + 1}</button>)}
              {currentPage < pageCount && <button className="primary-button more-jobs" onClick={() => changePage(currentPage + 1)}>Ver mais vagas <ChevronRight size={18} /></button>}
            </nav>}
          </div>
          {selected && <aside className={`job-detail ${mobileDetail ? 'mobile-visible' : ''}`} aria-label="Detalhes da vaga">
            <button className="text-button back-to-results" onClick={() => setMobileDetail(false)}><ArrowLeft size={18} /> Voltar às vagas</button>
            <div className="detail-header"><h2>{selected.title}</h2><button className="organization-link" onClick={() => info(selected.organization)}>{selected.organization}</button><p>{selected.location}</p>
              <div className="detail-actions"><button className="primary-button" onClick={() => setModal({ type: 'apply', title: 'Candidatura de demonstração', job: selected })}>Quero me candidatar <ArrowRight size={20} /></button><button className={`icon-button detail-save ${saved.includes(selected.id) ? 'saved' : ''}`} onClick={() => toggleSave(selected.id)} aria-label={saved.includes(selected.id) ? 'Remover vaga dos salvos' : 'Salvar vaga'} aria-pressed={saved.includes(selected.id)}><Bookmark size={21} fill={saved.includes(selected.id) ? 'currentColor' : 'none'} /></button></div>
            </div>
            <div className="detail-body"><section><h3>Dados da vaga</h3><p className="muted">Veja como você pode contribuir com esta oportunidade.</p><div className="detail-meta"><Clock3 size={20} /><div><strong>Dedicação</strong><span className="detail-tag">{selected.hours}</span></div></div><div className="detail-meta"><Globe2 size={20} /><div><strong>Formato de participação</strong><span className="detail-tag">{selected.mode}</span></div></div></section>
              <section><h3>Localização</h3><p className="inline-icon"><MapPin size={19} /> {selected.location}</p></section>
              <section><h3>Descrição completa da vaga</h3><p className="local-job-text">{selected.description}</p><h4>Como você vai contribuir</h4>{selected.local ? <p className="local-job-text">{selected.activities || 'Atividades a combinar com a organização.'}</p> : <ul><li>Participar das atividades junto à equipe do projeto.</li><li>Colaborar com a organização e o acolhimento dos participantes.</li><li>Compartilhar suas habilidades e aprender com a comunidade.</li></ul>}<h4>O que esperamos de você</h4><p className="local-job-text">{selected.requirements || 'Comprometimento, respeito e vontade de colaborar. Os horários e as atividades serão combinados com a organização.'}</p>{selected.local && <><h4>Número de participantes</h4><p>{selected.slots}</p></>}<h4>Causa</h4><span className="detail-tag">{selected.cause}</span><p className="demo-note">{selected.local ? 'Anúncio criado neste navegador, sem divulgação pública.' : 'Esta é uma oportunidade fictícia para demonstração do Voluntare.'} Nenhuma candidatura será enviada.</p></section>
            </div>
          </aside>}
        </div>
      </section>}
      </>}
    </main>

    <footer className="site-footer"><nav aria-label="Links úteis"><button onClick={() => info('Guia de voluntariado')}>Guia de voluntariado</button><button onClick={() => runSearch('', '')}>Pesquisar vagas</button><button onClick={() => info('Causas')}>Causas</button><button onClick={() => info('Voluntare Eventos')}>Voluntare Eventos</button><button onClick={() => info('País e idioma')}>Países</button><button onClick={() => info('Sobre o Voluntare')}>Sobre o Voluntare</button><button onClick={() => info('Ajuda')}>Ajuda</button></nav><nav aria-label="Informações legais"><span>© {new Date().getFullYear()} Voluntare</span><button onClick={() => info('Acessibilidade no Voluntare')}>Acessibilidade no Voluntare</button><button onClick={() => info('Privacidade')}>Centro de privacidade e preferências</button><button onClick={() => info('Termos')}>Termos</button></nav></footer>

    {modal && <Modal title={modal.title} onClose={() => setModal(null)}>
      {modal.type === 'account' ? <><p>Explore as oportunidades e encontre uma causa com a qual você se identifica.</p><button className="primary-button full-width" onClick={() => openScreen('profile')}>Entrar na demonstração <ArrowRight size={20} /></button><button className="text-button full-width" onClick={() => { setModal(null); runSearch('', ''); }}>Continuar sem uma conta</button></>
      : modal.type === 'apply' ? <><p><strong>{modal.job.title}</strong><br />{modal.job.organization}</p><div className="notice">Nesta versão local, você pode salvar seu interesse neste navegador; nenhum dado ou candidatura será enviado à organização.</div><button className="primary-button full-width" onClick={() => { setSaved(current => current.includes(modal.job.id) ? current : [...current, modal.job.id]); setModal({ type: 'success', title: 'Vaga salva para você' }); }}><Bookmark size={18} /> Salvar meu interesse</button></>
      : modal.type === 'success' ? <><div className="success-icon"><Check /></div><p>Seu interesse foi salvo neste navegador. A vaga aparece com o marcador preenchido na lista.</p><button className="primary-button full-width" onClick={() => setModal(null)}>Continuar explorando</button></>
      : <InfoContent jobs={allJobs} title={modal.title} onSearch={(q = '', l = '') => { setModal(null); runSearch(q, l); }} />}
    </Modal>}
  </>;
}

function InfoContent({ title, onSearch, jobs }) {
  if (title === 'País e idioma') return <><p>Você está na versão brasileira do Voluntare.</p><div className="notice inline-icon"><Check size={20} /> Brasil · Português (Brasil)</div></>;
  if (title === 'Privacidade') return <><p>Esta demonstração não envia seus dados a um servidor. Os identificadores das vagas salvas e os anúncios criados pela área de ONGs ficam no armazenamento local deste navegador.</p><p>Você pode remover uma vaga clicando novamente no marcador ou apagar os dados do site nas configurações do navegador.</p></>;
  if (title === 'Termos') return <p>O Voluntare está em fase de desenvolvimento. As organizações e oportunidades desta demonstração são fictícias. Não há inscrições reais, pagamentos ou vínculo com o Indeed.</p>;
  if (title === 'Causas') return <div className="modal-links">{causes.slice(1).map(item => <button key={item} onClick={() => onSearch(item)}>{item}<ChevronRight size={18} /></button>)}</div>;
  if (title === 'Conheça as organizações') return <><p>Explore as organizações fictícias que fazem parte desta demonstração. As avaliações estarão disponíveis em uma etapa futura.</p><div className="modal-links">{jobs.slice(0, 5).map(job => <button key={job.id} onClick={() => onSearch(job.organization)}>{job.organization}<ChevronRight size={18} /></button>)}</div></>;
  if (title === 'Guia de voluntariado' || title === 'Ajuda') return <><p>Busque por uma atividade, uma causa ou uma organização. Você também pode escolher uma cidade ou procurar por “remoto”.</p><p>Selecione uma vaga para conhecer suas atividades e o tempo de dedicação. Use o marcador para salvar as oportunidades de seu interesse.</p><button className="primary-button full-width" onClick={() => onSearch()}>Pesquisar vagas</button></>;
  if (title === 'Acessibilidade no Voluntare') return <p>Você pode navegar usando o teclado, acessar os campos pelos seus rótulos e ampliar a página. No celular, selecione uma vaga para abrir os detalhes e use “Voltar às vagas” para retornar à lista.</p>;
  if (title === 'Voluntare Eventos') return <><p>Encontre mutirões, campanhas e outras ações pontuais para participar.</p><button className="primary-button full-width" onClick={() => onSearch('mutirão')}>Explorar mutirões</button></>;
  if (title === 'Sobre o Voluntare') return <><p>Uma plataforma para aproximar pessoas, ONGs e ações sociais por meio do voluntariado.</p><p>Esta é a primeira versão do frontend, com oportunidades fictícias e sem integração com um servidor.</p></>;
  const organizationJobs = jobs.filter(job => job.organization === title);
  return <><p>{organizationJobs.some(job => job.local) ? 'Organização cadastrada em um anúncio local deste navegador.' : 'Organização fictícia da demonstração do Voluntare.'}</p>{organizationJobs.map(job => <p key={job.id}>{job.description}</p>)}<button className="primary-button full-width" onClick={() => onSearch(title)}>Ver oportunidades da organização</button></>;
}

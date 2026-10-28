import { useState } from 'react';
import { ArrowRight, Bell, Bookmark, CalendarDays, ChevronRight, Clock3, Eye, FileText, Globe2, Heart, MapPin, Pencil, Plus, X } from 'lucide-react';
import ExperienceSection from './ExperienceSection.jsx';

export default function AccountPages({ jobs, view, saved, toggleSave, onSearch, onOpenJob, onApplications, profile, setProfile, preferences, setPreferences }) {
  if (view === 'profile' || view === 'preferences') return <ProfilePage key={view} preferences={view === 'preferences'} profile={profile} setProfile={setProfile} settings={preferences} setSettings={setPreferences} />;
  if (view === 'myjobs') return <><MyJobs jobs={jobs} saved={saved} toggleSave={toggleSave} onSearch={onSearch} onOpenJob={onOpenJob} /><div className="saved-applications-link"><button className="text-button" onClick={onApplications}>Acompanhar minhas candidaturas <ArrowRight size={18} /></button></div></>;
  return <section className="notifications-page"><div className="empty-icon"><Bell size={62} strokeWidth={1.5} /></div><h1>Não há novas notificações.<br />Verifique mais tarde.</h1><p>Aqui você encontrará novidades sobre suas candidaturas e informações para ajudar na sua jornada de voluntariado.</p><button className="primary-button" onClick={onSearch}>Encontrar vagas</button><span className="account-demo-note">Demonstração local · notificações ainda não conectadas.</span></section>;
}

function ProfilePage({ preferences, profile, setProfile, settings, setSettings }) {
  const [tab, setTab] = useState(preferences ? 'preferences' : 'resume');
  const [editing, setEditing] = useState(false);
  const visible = settings.visible;
  const setVisible = value => setSettings(current => ({ ...current, visible: value }));
  const [preferenceEditor, setPreferenceEditor] = useState(null);
  const values = settings.values;
  const setValues = value => setSettings(current => ({ ...current, values: value }));
  const ready = settings.ready;
  const setReady = value => setSettings(current => ({ ...current, ready: value }));
  const initials = profile.name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'V';
  const preferenceRows = [
    ['Causas', Heart, ['Educação', 'Meio ambiente', 'Assistência social', 'Animais', 'Comunicação']],
    ['Horário disponível', Clock3, ['Fins de semana', 'Manhã', 'Tarde', 'Noite', 'Horário flexível']],
    ['Formato da vaga', Globe2, ['Remoto', 'Presencial', 'Híbrido']],
    ['Tempo de dedicação', CalendarDays, ['2 horas por semana', '4 horas por semana', '8 horas por semana', 'Ação pontual']],
    ['Deslocamento', MapPin, ['Até 5 km', 'Até 10 km', 'Até 25 km', 'Sem preferência']],
  ];
  return <section className="profile-page">
    <div className="profile-avatar">{initials}</div>
    <div className="profile-name"><h1>{profile.name}</h1><button className="icon-button" aria-label="Editar perfil" onClick={() => setEditing(!editing)}><Pencil size={19} /></button></div>
    <p className="profile-contact">{profile.city}</p><p className="profile-contact">{profile.email}</p>
    <button className="profile-visibility" onClick={() => setVisible(!visible)}><Eye size={18} />{visible ? 'As ONGs podem encontrar você' : 'Seu perfil está privado'}<ChevronRight size={17} /></button>
    <p className="profile-demo-label">Perfil de demonstração · alterações apenas nesta sessão</p>
    {editing && <form className="profile-editor" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); setProfile({ name: data.get('name').trim() || 'Pessoa voluntária', city: data.get('city').trim(), email: data.get('email').trim(), about: profile.about }); setEditing(false); }}>
      <h2>Editar perfil de demonstração</h2><p>Use dados fictícios. Estas informações não são enviadas a um servidor.</p>
      <label>Nome<input name="name" defaultValue={profile.name} required maxLength={80} /></label><label>Cidade e estado<input name="city" defaultValue={profile.city} maxLength={100} /></label><label>E-mail de exemplo<input name="email" type="email" defaultValue={profile.email} /></label>
      <div className="editor-actions"><button type="button" className="text-button" onClick={() => setEditing(false)}>Cancelar</button><button className="primary-button" type="submit">Salvar alterações</button></div>
    </form>}
    <div className="page-tabs" aria-label="Seções do perfil"><button className={tab === 'resume' ? 'active' : ''} aria-pressed={tab === 'resume'} onClick={() => setTab('resume')}>Perfil de voluntariado</button><button className={tab === 'preferences' ? 'active' : ''} aria-pressed={tab === 'preferences'} onClick={() => setTab('preferences')}>Preferências</button></div>
    {tab === 'resume' ? <div className="resume-content"><div className="resume-card"><div className="resume-card-heading"><FileText size={24} /><div><strong>Perfil Voluntare</strong><span>Suas habilidades podem fazer a diferença</span></div></div><label className="about-label" htmlFor="profile-about">Sobre você e suas habilidades</label><textarea id="profile-about" value={profile.about} onChange={event => setProfile({ ...profile, about: event.target.value })} placeholder="Conte quais atividades você gostaria de desenvolver..." maxLength={1500} /><p className="small-note">Rascunho mantido somente enquanto esta página estiver aberta.</p></div>
      <ExperienceSection key={profile.email.toLowerCase()} email={profile.email} />
    </div> : <div className="preferences-content"><p className="privacy-banner"><Eye size={19} /> Suas preferências ajudam a encontrar oportunidades.</p>{preferenceRows.map(([label, Icon, options]) => <div className="preference-row" key={label}><div className="preference-heading"><Icon size={20} /><h2>{label}</h2><button className="icon-button" aria-label={`Editar ${label.toLowerCase()}`} onClick={() => setPreferenceEditor(preferenceEditor === label ? null : label)}>{preferenceEditor === label ? <X size={19} /> : <Plus size={20} />}</button></div>{preferenceEditor === label ? <label className="preference-select"><span className="sr-only">{label}</span><select value={values[label]} onChange={event => { setValues({ ...values, [label]: event.target.value }); setPreferenceEditor(null); }}>{options.map(option => <option key={option}>{option}</option>)}</select></label> : <span className="preference-value">{values[label]}</span>}</div>)}<div className="availability"><h2>Disponibilidade</h2><div><div><strong>Estou disponível para começar</strong><p>Indique se você pode participar de uma ação agora.</p></div><button role="switch" aria-checked={ready} aria-label="Estou disponível para começar" className={`switch ${ready ? 'on' : ''}`} onClick={() => setReady(!ready)}><span /></button></div></div></div>}
  </section>;
}

function MyJobs({ jobs, saved, toggleSave, onSearch, onOpenJob }) {
  const [tab, setTab] = useState('Salvas');
  const tabs = ['Salvas'];
  const savedJobs = jobs.filter(job => saved.includes(job.id));
  const title = { Salvas: 'Nenhuma vaga salva', 'Candidaturas feitas': 'Nenhuma candidatura', Participações: 'Nenhuma participação confirmada', Arquivo: 'Nenhuma vaga arquivada' };
  return <section className="myjobs-page"><h1>Minhas vagas</h1><div className="page-tabs myjobs-tabs" aria-label="Etapas das vagas">{tabs.map(item => <button key={item} className={tab === item ? 'active' : ''} aria-pressed={tab === item} onClick={() => setTab(item)}>{item !== 'Arquivo' && <span>{item === 'Salvas' ? savedJobs.length : 0}</span>}{item}</button>)}</div>
    {tab === 'Salvas' && savedJobs.length > 0 ? <div className="saved-jobs">{savedJobs.map(job => <article className="saved-job" key={job.id}><div><h2><button onClick={() => onOpenJob(job)}>{job.title}</button></h2><p>{job.organization}</p><p>{job.location} · {job.mode}</p><span className="detail-tag">{job.hours}</span></div><button className="icon-button saved" aria-label={`Remover dos salvos: ${job.title}`} onClick={() => toggleSave(job.id)}><Bookmark fill="currentColor" size={21} /></button></article>)}</div>
    : <div className="myjobs-empty"><div className="empty-icon"><Bookmark size={58} strokeWidth={1.5} /></div><h2>{title[tab]}</h2><p>{tab === 'Salvas' ? 'Salve as oportunidades que você quer conhecer melhor.' : 'Acompanhe aqui os próximos passos da sua jornada.'}</p>{tab !== 'Salvas' && <p className="small-note">O envio de candidaturas e a confirmação de participações dependem da integração com o servidor.</p>}<button className="primary-button" onClick={onSearch}>Achar vagas <ArrowRight size={21} /></button></div>}
  </section>;
}


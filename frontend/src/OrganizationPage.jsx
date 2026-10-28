import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Clock3, FileText, HeartHandshake, MapPin, Pencil, Plus, Search, Users } from 'lucide-react';
import { emptyJob, jobCauses, jobModes, prepareJob, validateJob } from './organizationJobs.js';
import { normalize } from './data.js';
import './organization.css';

const statusLabels = { active: 'Ativa', closed: 'Encerrada' };

export default function OrganizationPage({ jobs: storedJobs, onSave, storageError, onOpenJob, organizationName }) {
  const jobs = storedJobs.filter(job => job.status === 'active' || job.status === 'closed');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const headingRef = useRef(null);
  function edit(job = {}) { setEditing({ ...job, organization: organizationName }); setNotice(''); window.scrollTo({ top: 0 }); }
  function finish(job) {
    if (!onSave(job)) return;
    setEditing(null);
    setNotice('Vaga publicada na busca deste navegador.');
    setFilter('all'); setQuery(''); window.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  const filtered = jobs.filter(job => (filter === 'all' || filter === job.status) && normalize(`${job.title} ${job.organization}`).includes(normalize(query)));
  if (editing) return <JobEditor key={editing.id || 'new'} job={editing} onSave={finish} onCancel={() => setEditing(null)} storageError={storageError} />;
  return <section className="ong-page">
    <div className="ong-heading"><div><div className="ong-eyebrow"><Building2 size={16} /> Área da organização</div><h1 ref={headingRef} tabIndex={-1}>Suas oportunidades,<br className="ong-title-break" /> novos voluntários.</h1><p>Crie e acompanhe as vagas da sua ONG ou projeto social.</p></div><button className="primary-button" onClick={() => edit()}><Plus size={20} /> Anunciar uma vaga</button></div>
    <div className="ong-local-note"><FileText size={18} /><span>Os anúncios ficam salvos apenas neste navegador. A divulgação pública estará disponível com a integração ao servidor.</span></div>
    {storageError && <p className="ong-error-banner" role="alert">{storageError}</p>}
    {notice && <p className="ong-success" role="status"><CheckCircle2 size={19} />{notice}</p>}
    <div className="ong-stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>{[['active', 'Vagas ativas', HeartHandshake], ['closed', 'Encerradas', CheckCircle2]].map(([status, label, Icon]) => <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)} aria-pressed={filter === status} className={filter === status ? 'selected' : ''}><span><Icon size={20} />{label}</span><strong>{jobs.filter(job => job.status === status).length}</strong></button>)}</div>
    <div className="ong-list-header"><h2>Minhas vagas</h2><label className="ong-search"><Search size={18} /><span className="sr-only">Buscar minhas vagas</span><input placeholder="Buscar por título ou organização" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    <div className="ong-tabs" aria-label="Status dos anúncios">{[['all', 'Todas'], ['active', 'Ativas'], ['closed', 'Encerradas']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
    {!filtered.length ? <div className="ong-empty"><div className="ong-empty-icon"><HeartHandshake size={40} strokeWidth={1.5} /></div><h3>{jobs.length ? 'Nenhuma vaga neste filtro' : 'Sua próxima ação começa com um convite'}</h3><p>{jobs.length ? 'Busque por outro título ou escolha um status diferente.' : 'Conte o que sua organização faz e encontre pessoas que querem contribuir com a sua causa.'}</p>{jobs.length ? <button className="text-button" onClick={() => { setFilter('all'); setQuery(''); }}>Mostrar todas as vagas</button> : <button className="primary-button" onClick={() => edit()}>Criar minha primeira vaga <ArrowRight size={18} /></button>}</div>
    : <div className="ong-job-list">{filtered.map(job => <article className="ong-job-row" key={job.id}><div className="ong-job-summary"><span className={`ong-status ${job.status}`}>{statusLabels[job.status]}</span><h3>{job.title}</h3><p>{job.organization}</p><div className="ong-job-meta"><span><MapPin size={15} />{job.location || 'Local a definir'}</span><span><Clock3 size={15} />{job.hours || 'Dedicação a definir'}</span><span><Users size={15} />{job.slots || '1'} participante(s)</span></div></div><div className="ong-job-actions"><button className="ong-outline-button" onClick={() => edit(job)}><Pencil size={16} />Editar</button>{job.status === 'active' && <button className="text-button" onClick={() => onOpenJob(job)}>Ver na busca</button>}{job.status !== 'draft' && <button className="text-button" onClick={() => { const status = job.status === 'active' ? 'closed' : 'active'; if (!onSave({ ...job, status, updatedAt: Date.now() })) return; setNotice(status === 'closed' ? 'Vaga encerrada e retirada da busca. Você pode reabri-la a qualquer momento.' : 'Vaga reaberta na busca deste navegador.'); }}>{job.status === 'active' ? 'Encerrar vaga' : 'Reabrir vaga'}</button>}</div></article>)}</div>}
  </section>;
}

function JobEditor({ job, onSave, onCancel, storageError }) {
  const [form, setForm] = useState({ ...emptyJob, ...job });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  function update(event) { const { name, value } = event.target; setForm(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: undefined })); }
  function submit(event) {
    event.preventDefault();
    const status = 'active';
    const nextErrors = validateJob(form, status); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus()); return; }
    onSave(prepareJob(form, status, job.id ? job : null));
  }
  function field(name, label, { type = 'text', placeholder, maxLength = 120, optional = false, options } = {}) {
    const attrs = { id: `ong-${name}`, name, value: form[name], onChange: update, readOnly: name === 'organization', 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `error-${name}` : undefined };
    return <div className="ong-field"><label htmlFor={attrs.id}>{label}{optional && <span> (opcional)</span>}</label>{options ? <select {...attrs}>{options.map(option => <option key={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea {...attrs} rows={5} maxLength={maxLength} placeholder={placeholder} /> : <input {...attrs} type={type} maxLength={maxLength} placeholder={placeholder} {...(type === 'number' ? { min: 1, max: 999, step: 1 } : {})} />}{errors[name] && <span className="ong-field-error" id={`error-${name}`}>{errors[name]}</span>}</div>;
  }
  return <section className="ong-page ong-editor"><button className="text-button" onClick={onCancel}><ArrowLeft size={17} />Voltar às minhas vagas</button><div className="ong-editor-heading"><div className="ong-eyebrow">Anunciar uma oportunidade</div><h1>{job.id ? 'Editar vaga' : 'Encontre quem quer fazer a diferença.'}</h1><p>Apresente sua causa e conte como os voluntários podem ajudar.</p></div>
    {storageError && <p className="ong-error-banner" role="alert">{storageError}</p>}
    <form ref={formRef} onSubmit={submit} noValidate className="ong-form-layout"><div className="ong-form-fields"><section className="ong-form-section"><h2><span>1</span> Sobre a organização</h2>{field('organization', 'Nome da ONG ou projeto', { placeholder: 'Ex.: Instituto Novos Caminhos' })}</section>
      <section className="ong-form-section"><h2><span>2</span> A oportunidade</h2>{field('title', 'Título da vaga', { placeholder: 'Ex.: Voluntário para reforço escolar' })}<div className="ong-field-grid">{field('cause', 'Causa', { options: jobCauses })}{field('mode', 'Formato', { options: jobModes })}</div>{form.mode !== 'Remoto' && field('location', 'Cidade e estado', { placeholder: 'Ex.: Joinville, SC' })}<div className="ong-field-grid">{field('hours', 'Tempo de dedicação', { placeholder: 'Ex.: 4 horas por semana', maxLength: 80 })}{field('slots', 'Número de participantes', { type: 'number' })}</div></section>
      <section className="ong-form-section"><h2><span>3</span> Atividades e expectativas</h2>{field('description', 'Descrição da oportunidade', { type: 'textarea', maxLength: 5000, placeholder: 'Apresente o projeto, o público atendido e o impacto esperado. Mínimo de 40 caracteres.' })}{field('activities', 'Como a pessoa vai contribuir', { type: 'textarea', maxLength: 3000, optional: true, placeholder: 'Descreva as atividades e a rotina de participação.' })}{field('requirements', 'O que esperamos de você', { type: 'textarea', maxLength: 3000, optional: true, placeholder: 'Quais habilidades, experiências ou disponibilidades são importantes?' })}</section>
      {Object.values(errors).some(Boolean) && <p role="alert" className="ong-error-banner">Revise os campos indicados antes de continuar.</p>}
      <div className="ong-form-actions"><button type="button" className="text-button" onClick={onCancel}>Cancelar</button><button type="submit" className="primary-button">{job.status === 'active' ? 'Salvar e atualizar vaga' : 'Publicar vaga'}</button></div><p className="ong-form-footnote">Ao publicar, a vaga aparecerá somente na busca local deste navegador.</p>
    </div><aside className="ong-preview"><div className="ong-preview-label"><EyeIcon />Prévia do anúncio</div><article><span className="ong-preview-cause">{form.cause}</span><h2>{form.title || 'Título da oportunidade'}</h2><p>{form.organization || 'Nome da sua organização'}</p><p className="inline-icon"><MapPin size={16} />{form.mode === 'Remoto' ? 'Remoto' : form.location || 'Cidade, estado'}</p><div className="tags"><span>{form.mode}</span><span>{form.hours || 'Tempo de dedicação'}</span></div><p className="ong-preview-description">{form.description || 'A descrição da sua oportunidade aparecerá aqui. Seja claro sobre as atividades e o impacto do trabalho voluntário.'}</p></article><div className="ong-writing-tip"><Check size={19} /><p><strong>Um bom anúncio aproxima pessoas.</strong> Explique as atividades, os horários e o apoio oferecido pela sua equipe.</p></div></aside></form>
  </section>;
}

function EyeIcon() { return <Search size={17} aria-hidden="true" />; }

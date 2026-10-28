import { useRef, useState } from 'react';
import { BriefcaseBusiness, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import './experiences.css';

const empty = { role: '', organization: '', type: 'Voluntariado', location: '', start: '', end: '', current: false, description: '', skills: '' };
const types = ['Voluntariado', 'Experiência profissional', 'Projeto pessoal', 'Atividade acadêmica'];
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
function monthLabel(value) { if (!monthPattern.test(value)) return ''; const [year, month] = value.split('-'); return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, 1)); }
function load(key) {
  try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data.filter(item => item && typeof item.id === 'string' && Object.keys(empty).every(field => typeof item[field] === typeof empty[field]) && monthPattern.test(item.start)) : []; } catch { return []; }
}

export default function ExperienceSection({ email }) {
  const key = `voluntare-experiences-v1:${email.trim().toLowerCase()}`;
  const [experiences, setExperiences] = useState(() => load(key));
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removed, setRemoved] = useState(null);
  const addRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  function save(next) {
    try { localStorage.setItem(key, JSON.stringify(next)); setExperiences(next); setError(''); return true; }
    catch { setError('Não foi possível salvar. Permita o armazenamento neste navegador e tente novamente.'); return false; }
  }
  function open(item = empty) { setDraft({ ...item }); setError(''); setNotice(''); }
  function close() { setDraft(null); setError(''); requestAnimationFrame(() => addRef.current?.focus()); }
  function submit(event) {
    event.preventDefault();
    if (!draft.role.trim() || !draft.organization.trim()) { setError('Preencha a função e a organização.'); return; }
    if (!monthPattern.test(draft.start)) { setError('Informe um mês e ano de início válidos.'); startRef.current?.focus(); return; }
    if (!draft.current && (!monthPattern.test(draft.end) || draft.end < draft.start)) { setError('A data de término deve ser igual ou posterior ao início.'); endRef.current?.focus(); return; }
    const nextItem = { ...draft, role: draft.role.trim(), organization: draft.organization.trim(), location: draft.location.trim(), description: draft.description.trim(), skills: draft.skills.trim(), end: draft.current ? '' : draft.end, id: draft.id || crypto.randomUUID() };
    const next = draft.id ? experiences.map(item => item.id === draft.id ? nextItem : item) : [...experiences, nextItem];
    if (save(next)) { setRemoved(null); setNotice(draft.id ? 'Experiência atualizada.' : 'Experiência adicionada.'); close(); }
  }
  function field(name, value) { setDraft(current => ({ ...current, [name]: value })); setError(''); }
  const sorted = [...experiences].sort((a, b) => Number(b.current) - Number(a.current) || b.start.localeCompare(a.start));
  return <section className="experience-section" aria-labelledby="experience-title"><div className="experience-heading"><div><h2 id="experience-title"><BriefcaseBusiness size={23} />Experiências</h2><p>Conte sua trajetória e como você já contribuiu.</p></div><button ref={addRef} className="icon-button" aria-label="Adicionar experiência" onClick={() => open()}><Plus size={23} /></button></div>
    <p className="experience-local-note">Experiências salvas neste navegador para o e-mail deste perfil. Use dados de exemplo nesta demonstração.</p>
    {notice && <div className="experience-feedback" role="status">{notice}{removed && <button className="text-button" onClick={() => { if (save([...experiences, removed])) { setRemoved(null); setNotice('Experiência restaurada.'); } }}>Desfazer</button>}</div>}
    {draft ? <form className="experience-editor" onSubmit={submit}><h3>{draft.id ? 'Editar experiência' : 'Adicionar experiência'}</h3><p className="small-note">Campos com * são obrigatórios.</p><label>Função ou cargo *<input autoFocus required maxLength={100} value={draft.role} onChange={event => field('role', event.target.value)} placeholder="Ex.: Educador voluntário" /></label><label>Organização ou projeto *<input required maxLength={120} value={draft.organization} onChange={event => field('organization', event.target.value)} placeholder="Ex.: Instituto Novos Caminhos" /></label><div className="experience-fields"><label>Tipo de experiência<select value={draft.type} onChange={event => field('type', event.target.value)}>{types.map(type => <option key={type}>{type}</option>)}</select></label><label>Localidade<input maxLength={100} value={draft.location} onChange={event => field('location', event.target.value)} placeholder="Ex.: Joinville, SC ou Remoto" /></label></div><label className="experience-checkbox"><input type="checkbox" checked={draft.current} onChange={event => field('current', event.target.checked)} />Atuo atualmente nesta função</label><div className="experience-fields"><label>Início *<input ref={startRef} type="month" required value={draft.start} onChange={event => field('start', event.target.value)} /></label>{!draft.current && <label>Término *<input ref={endRef} type="month" required min={draft.start || undefined} value={draft.end} onChange={event => field('end', event.target.value)} /></label>}</div><label>Atividades e conquistas<textarea rows={5} maxLength={3000} value={draft.description} onChange={event => field('description', event.target.value)} placeholder="Descreva suas responsabilidades, o público atendido e os resultados da sua contribuição." /></label><small className="experience-counter">{draft.description.length}/3000</small><label>Competências desenvolvidas<input maxLength={240} value={draft.skills} onChange={event => field('skills', event.target.value)} placeholder="Ex.: Comunicação, trabalho em equipe, liderança" /><small>Separe as competências por vírgulas.</small></label>{error && <p className="ong-error-banner" role="alert">{error}</p>}<div className="experience-actions"><button className="text-button" type="button" onClick={close}>Cancelar</button><button className="primary-button" type="submit">Salvar experiência</button></div></form>
    : <>{error && <p className="ong-error-banner" role="alert">{error}</p>}{!sorted.length ? <div className="experience-empty"><span><BriefcaseBusiness size={30} strokeWidth={1.5} /></span><h3>Cada experiência conta uma história</h3><p>Inclua trabalhos voluntários, experiências profissionais ou projetos. Mostre o que você fez e o que aprendeu.</p><button className="text-button" onClick={() => open()}><Plus size={17} />Adicionar primeira experiência</button></div> : <div className="experience-list">{sorted.map(item => <article className="experience-item" key={item.id}><div className="experience-logo" aria-hidden="true">{item.organization.slice(0, 2).toUpperCase()}</div><div className="experience-content"><h3>{item.role}</h3><p className="experience-company">{item.organization} · {item.type}</p><p className="experience-period">{monthLabel(item.start)} — {item.current ? 'Atual' : monthLabel(item.end)}{item.current && <span className="experience-current">Em andamento</span>}</p>{item.location && <p className="experience-location"><MapPin size={14} />{item.location}</p>}{item.description && <p className="experience-description">{item.description}</p>}{item.skills && <div className="experience-skills" aria-label="Competências">{[...new Set(item.skills.split(',').map(skill => skill.trim()).filter(Boolean))].map(skill => <span key={skill}>{skill}</span>)}</div>}<div className="experience-item-actions"><button className="text-button" aria-label={`Editar experiência: ${item.role}`} onClick={() => open(item)}><Pencil size={14} />Editar</button><button className="text-button" aria-label={`Remover experiência: ${item.role}`} onClick={() => { if (save(experiences.filter(experience => experience.id !== item.id))) { setRemoved(item); setNotice('Experiência removida.'); } }}><Trash2 size={14} />Remover</button></div></div></article>)}</div>}</>}
  </section>;
}

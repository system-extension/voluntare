import { useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Globe2,
  Heart,
  MapPin,
  Pencil,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';

/**
 * Perfil e preferências da conta de demonstração.
 * Mantido como estava: o perfil será refeito com os campos do DER quando o login (E2) existir.
 */
export default function Perfil({ abaInicial }) {
  useTitulo(abaInicial === 'preferences' ? 'Preferências' : 'Meu perfil');
  const {
    perfil: profile,
    setPerfil: setProfile,
    preferencias: settings,
    setPreferencias: setSettings,
  } = useConta();
  const preferences = abaInicial === 'preferences';
  const [tab, setTab] = useState(preferences ? 'preferences' : 'resume');
  const [editing, setEditing] = useState(false);
  const visible = settings.visible;
  const setVisible = (value) => setSettings((current) => ({ ...current, visible: value }));
  const [preferenceEditor, setPreferenceEditor] = useState(null);
  const values = settings.values;
  const setValues = (value) => setSettings((current) => ({ ...current, values: value }));
  const ready = settings.ready;
  const setReady = (value) => setSettings((current) => ({ ...current, ready: value }));
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const initials =
    profile.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'V';
  const preferenceRows = [
    [
      'Causas',
      Heart,
      ['Educação', 'Meio ambiente', 'Assistência social', 'Animais', 'Comunicação'],
    ],
    [
      'Horário disponível',
      Clock3,
      ['Fins de semana', 'Manhã', 'Tarde', 'Noite', 'Horário flexível'],
    ],
    ['Formato da vaga', Globe2, ['Remoto', 'Presencial', 'Híbrido']],
    [
      'Tempo de dedicação',
      CalendarDays,
      ['2 horas por semana', '4 horas por semana', '8 horas por semana', 'Ação pontual'],
    ],
    ['Deslocamento', MapPin, ['Até 5 km', 'Até 10 km', 'Até 25 km', 'Sem preferência']],
  ];
  return (
    <section className="profile-page">
      <div className="profile-avatar">{initials}</div>
      <div className="profile-name">
        <h1>{profile.name}</h1>
        <button
          className="icon-button"
          aria-label="Editar perfil"
          onClick={() => setEditing(!editing)}
        >
          <Pencil size={19} />
        </button>
      </div>
      <p className="profile-contact">{profile.city}</p>
      <p className="profile-contact">{profile.email}</p>
      <button className="profile-visibility" onClick={() => setVisible(!visible)}>
        <Eye size={18} />
        {visible ? 'As ONGs podem encontrar você' : 'Seu perfil está privado'}
        <ChevronRight size={17} />
      </button>
      <p className="profile-demo-label">Perfil de demonstração · alterações apenas nesta sessão</p>
      {editing && (
        <form
          className="profile-editor"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setProfile({
              name: data.get('name').trim() || 'Pessoa voluntária',
              city: data.get('city').trim(),
              email: data.get('email').trim(),
              about: profile.about,
            });
            setEditing(false);
          }}
        >
          <h2>Editar perfil de demonstração</h2>
          <p>Use dados fictícios. Estas informações não são enviadas a um servidor.</p>
          <label>
            Nome
            <input name="name" defaultValue={profile.name} required maxLength={80} />
          </label>
          <label>
            Cidade e estado
            <input name="city" defaultValue={profile.city} maxLength={100} />
          </label>
          <label>
            E-mail de exemplo
            <input name="email" type="email" defaultValue={profile.email} />
          </label>
          <div className="editor-actions">
            <button type="button" className="text-button" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              Salvar alterações
            </button>
          </div>
        </form>
      )}
      <div className="page-tabs" aria-label="Seções do perfil">
        <button
          className={tab === 'resume' ? 'active' : ''}
          aria-pressed={tab === 'resume'}
          onClick={() => setTab('resume')}
        >
          Perfil de voluntariado
        </button>
        <button
          className={tab === 'preferences' ? 'active' : ''}
          aria-pressed={tab === 'preferences'}
          onClick={() => setTab('preferences')}
        >
          Preferências
        </button>
      </div>
      {tab === 'resume' ? (
        <div className="resume-content">
          <div className="resume-card">
            <div className="resume-card-heading">
              <FileText size={24} />
              <div>
                <strong>Perfil Voluntare</strong>
                <span>Suas habilidades podem fazer a diferença</span>
              </div>
            </div>
            <label className="about-label" htmlFor="profile-about">
              Sobre você e suas habilidades
            </label>
            <textarea
              id="profile-about"
              value={profile.about}
              onChange={(event) => setProfile({ ...profile, about: event.target.value })}
              placeholder="Conte quais atividades você gostaria de desenvolver..."
              maxLength={1500}
            />
            <p className="small-note">
              Rascunho mantido somente enquanto esta página estiver aberta.
            </p>
          </div>
          <label className="upload-card">
            <Upload size={26} />
            <strong>{fileName || 'Adicionar um currículo'}</strong>
            <span>Arquivo PDF, .doc ou .docx com menos de 5 MB.</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024 || !/\.(pdf|docx?)$/i.test(file.name)) {
                  setFileError('Escolha um PDF, DOC ou DOCX de até 5 MB.');
                  event.target.value = '';
                  return;
                }
                setFileName(file.name);
                setFileError('');
              }}
            />
          </label>
          {fileError && (
            <p role="alert" className="file-error">
              {fileError}
            </p>
          )}
          {fileName && (
            <button className="text-button" onClick={() => setFileName('')}>
              Remover arquivo selecionado
            </button>
          )}
          <p className="small-note">
            Nenhum arquivo é enviado ou armazenado. A seleção serve apenas para visualizar a
            interface.
          </p>
        </div>
      ) : (
        <div className="preferences-content">
          <p className="privacy-banner">
            <Eye size={19} /> Suas preferências ajudam a encontrar oportunidades.
          </p>
          {preferenceRows.map(([label, Icon, options]) => (
            <div className="preference-row" key={label}>
              <div className="preference-heading">
                <Icon size={20} />
                <h2>{label}</h2>
                <button
                  className="icon-button"
                  aria-label={`Editar ${label.toLowerCase()}`}
                  onClick={() => setPreferenceEditor(preferenceEditor === label ? null : label)}
                >
                  {preferenceEditor === label ? <X size={19} /> : <Plus size={20} />}
                </button>
              </div>
              {preferenceEditor === label ? (
                <label className="preference-select">
                  <span className="sr-only">{label}</span>
                  <select
                    value={values[label]}
                    onChange={(event) => {
                      setValues({ ...values, [label]: event.target.value });
                      setPreferenceEditor(null);
                    }}
                  >
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="preference-value">{values[label]}</span>
              )}
            </div>
          ))}
          <div className="availability">
            <h2>Disponibilidade</h2>
            <div>
              <div>
                <strong>Estou disponível para começar</strong>
                <p>Indique se você pode participar de uma ação agora.</p>
              </div>
              <button
                role="switch"
                aria-checked={ready}
                aria-label="Estou disponível para começar"
                className={`switch ${ready ? 'on' : ''}`}
                onClick={() => setReady(!ready)}
              >
                <span />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

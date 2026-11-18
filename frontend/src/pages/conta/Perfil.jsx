import { useState } from 'react';
import { CheckCircle2, Clock3, MapPin, Pencil, Phone } from 'lucide-react';
import { buscarMeuPerfil, listarHabilidades, salvarMeuPerfil } from '../../api/voluntarios';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useTitulo from '../../hooks/useTitulo';

/** Perfil do voluntário (GET/PUT /api/voluntarios/eu): dados de contato, disponibilidade e habilidades. */
export default function Perfil() {
  useTitulo('Meu perfil');
  const perfil = useCarregar(buscarMeuPerfil);
  const catalogo = useCarregar(listarHabilidades);
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState('');

  if (perfil.erro)
    return <ErroCarregamento erro={perfil.erro} aoTentarNovamente={perfil.recarregar} />;
  if (!perfil.dados) return <Carregando />;

  const p = perfil.dados;
  const iniciais =
    p.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((palavra) => palavra[0])
      .join('')
      .toUpperCase() || 'V';

  return (
    <section className="profile-page">
      <div className="profile-avatar">{iniciais}</div>
      <div className="profile-name">
        <h1>{p.nome}</h1>
        {!editando && (
          <button
            className="icon-button"
            aria-label="Editar perfil"
            onClick={() => {
              setAviso('');
              setEditando(true);
            }}
          >
            <Pencil size={19} />
          </button>
        )}
      </div>
      <p className="profile-contact">{p.email}</p>

      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} /> {aviso}
        </p>
      )}

      {editando ? (
        <EditorPerfil
          perfil={p}
          catalogo={catalogo.dados ?? []}
          aoCancelar={() => setEditando(false)}
          aoSalvar={() => {
            setEditando(false);
            setAviso('Perfil atualizado.');
            perfil.recarregar();
          }}
        />
      ) : (
        <div className="perfil-resumo">
          <p className="inline-icon">
            <Phone size={17} /> {p.telefone || 'Telefone não informado'}
          </p>
          <p className="inline-icon">
            <MapPin size={17} /> {p.cidade || 'Cidade não informada'}
          </p>
          <h2>
            <Clock3 size={18} /> Disponibilidade
          </h2>
          <p className="perfil-texto">{p.disponibilidade || 'Conte quando você pode ajudar.'}</p>
          <h2>Habilidades</h2>
          <Etiquetas lista={p.habilidades} vazio="O que você sabe fazer e pode oferecer." />
          <h2>Interesses</h2>
          <Etiquetas lista={p.interesses} vazio="O que você gostaria de aprender ou praticar." />
          <p className="small-note">
            A organização vê esses dados quando você se candidata a uma vaga dela.
          </p>
        </div>
      )}
    </section>
  );
}

function Etiquetas({ lista, vazio }) {
  if (!lista.length) return <p className="perfil-texto muted">{vazio}</p>;
  return (
    <div className="tags">
      {lista.map((h) => (
        <span key={h.id}>{h.nome}</span>
      ))}
    </div>
  );
}

function EditorPerfil({ perfil, catalogo, aoCancelar, aoSalvar }) {
  const [form, setForm] = useState({
    nome: perfil.nome,
    telefone: perfil.telefone ?? '',
    cidade: perfil.cidade ?? '',
    disponibilidade: perfil.disponibilidade ?? '',
  });
  const [habilidades, setHabilidades] = useState(perfil.habilidades.map((h) => h.id));
  const [interesses, setInteresses] = useState(perfil.interesses.map((h) => h.id));
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);

  const atualizar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErros({ ...erros, [e.target.name]: undefined });
  };

  // uma habilidade é habilidade ou interesse, nunca os dois (RN-53)
  const alternar = (id, lista, setLista, outra, setOutra) => {
    setLista(lista.includes(id) ? lista.filter((i) => i !== id) : [...lista, id]);
    if (outra.includes(id)) setOutra(outra.filter((i) => i !== id));
  };

  async function enviar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return setErros({ nome: 'Informe o nome.' });
    setEnviando(true);
    try {
      await salvarMeuPerfil({
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        cidade: form.cidade.trim() || null,
        disponibilidade: form.disponibilidade.trim() || null,
        habilidadeIds: habilidades,
        interesseIds: interesses,
      });
      aoSalvar();
    } catch (erro) {
      setErroEnvio(erro.message);
      setErros(Object.fromEntries((erro.campos ?? []).map((c) => [c.campo, c.mensagem])));
    } finally {
      setEnviando(false);
    }
  }

  const campo = (name, label, props = {}) => (
    <label>
      {label}
      <input
        name={name}
        value={form[name]}
        onChange={atualizar}
        aria-invalid={!!erros[name]}
        {...props}
      />
      {erros[name] && <span className="ong-field-error">{erros[name]}</span>}
    </label>
  );

  return (
    <form className="profile-editor" onSubmit={enviar} noValidate>
      <h2>Editar perfil</h2>
      {campo('nome', 'Nome', { maxLength: 120, required: true })}
      {campo('telefone', 'Telefone', { maxLength: 20, placeholder: '(47) 99999-0000' })}
      {campo('cidade', 'Cidade', { maxLength: 100, placeholder: 'Ex.: Joinville' })}
      <label>
        Disponibilidade
        <textarea
          name="disponibilidade"
          value={form.disponibilidade}
          onChange={atualizar}
          rows={3}
          maxLength={2000}
          placeholder="Ex.: sábados de manhã e quartas à noite"
        />
      </label>

      <fieldset className="perfil-escolhas">
        <legend>Habilidades: o que você sabe fazer</legend>
        {catalogo.map((h) => (
          <button
            type="button"
            key={h.id}
            aria-pressed={habilidades.includes(h.id)}
            onClick={() => alternar(h.id, habilidades, setHabilidades, interesses, setInteresses)}
          >
            {h.nome}
          </button>
        ))}
      </fieldset>
      <fieldset className="perfil-escolhas">
        <legend>Interesses: o que você quer aprender</legend>
        {catalogo.map((h) => (
          <button
            type="button"
            key={h.id}
            aria-pressed={interesses.includes(h.id)}
            onClick={() => alternar(h.id, interesses, setInteresses, habilidades, setHabilidades)}
          >
            {h.nome}
          </button>
        ))}
      </fieldset>

      {erroEnvio && (
        <p className="ong-error-banner" role="alert">
          {erroEnvio}
        </p>
      )}
      <div className="editor-actions">
        <button type="button" className="text-button" onClick={aoCancelar}>
          Cancelar
        </button>
        <button className="primary-button" type="submit" disabled={enviando}>
          Salvar perfil
        </button>
      </div>
    </form>
  );
}

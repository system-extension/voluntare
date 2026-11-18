import { useState } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cadastrarCoordenador, desativarMembro, listarEquipe } from '../../api/organizacoes';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useTitulo from '../../hooks/useTitulo';
import { ROTULO_PAPEL } from '../../utils/papeis';
import './organizacao.css';

const VAZIO = { nome: '', email: '', senha: '' };

/** Rota /organizacao/equipe, só do gestor (RN-14 e RN-15). */
export default function Equipe() {
  useTitulo('Equipe');
  const navegar = useNavigate();
  const equipe = useCarregar(listarEquipe);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [desativando, setDesativando] = useState(null);

  if (equipe.erro)
    return <ErroCarregamento erro={equipe.erro} aoTentarNovamente={equipe.recarregar} />;
  if (!equipe.dados) return <Carregando />;

  const camposDoErro = (e) =>
    Object.fromEntries((e.campos ?? []).map((c) => [c.campo, c.mensagem]));

  async function cadastrar(e) {
    e.preventDefault();
    try {
      const novo = await cadastrarCoordenador({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      setForm(VAZIO);
      setErros({});
      setErro('');
      setAviso(`${novo.nome} cadastrado. Passe o e-mail e a senha inicial para a pessoa entrar.`);
      equipe.recarregar();
    } catch (e) {
      setAviso('');
      setErro(e.message);
      setErros(camposDoErro(e));
    }
  }

  async function desativar(membro, novoResponsavelId) {
    try {
      await desativarMembro(membro.id, novoResponsavelId);
      setDesativando(null);
      setErro('');
      setAviso(`${membro.nome} desativado.`);
      equipe.recarregar();
    } catch (e) {
      setAviso('');
      // o backend aponta o campo novoResponsavelId quando falta quem assuma as vagas
      setErro(camposDoErro(e).novoResponsavelId ?? e.message);
    }
  }

  const ativos = equipe.dados.filter((m) => m.ativo);

  return (
    <section className="ong-page">
      <button className="text-button" onClick={() => navegar('/organizacao')}>
        <ArrowLeft size={17} /> Voltar às vagas
      </button>
      <div className="ong-heading">
        <div>
          <div className="ong-eyebrow">Área da organização</div>
          <h1>Equipe</h1>
          <p>Coordenadores cuidam das vagas que o gestor deixar com eles.</p>
        </div>
      </div>
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} /> {aviso}
        </p>
      )}

      <div className="ong-job-list">
        {equipe.dados.map((m) => (
          <article className="ong-job-row" key={m.id}>
            <div className="ong-job-summary">
              <span className={`ong-status ${m.ativo ? 'active' : 'cancelled'}`}>
                {m.ativo ? ROTULO_PAPEL[m.papel] : 'Desativado'}
              </span>
              <h3>{m.nome}</h3>
              <p>{m.email}</p>
              <p className="ong-form-footnote">
                {m.vagasEmAndamento === 1
                  ? '1 vaga em andamento'
                  : `${m.vagasEmAndamento} vagas em andamento`}
              </p>
            </div>
            {m.ativo && m.papel === 'COORDENADOR' && (
              <div className="ong-job-actions">
                {desativando === m.id ? (
                  <Desativar
                    membro={m}
                    opcoes={ativos.filter((a) => a.id !== m.id)}
                    aoConfirmar={(novo) => desativar(m, novo)}
                    aoCancelar={() => setDesativando(null)}
                  />
                ) : (
                  <button className="text-button" onClick={() => setDesativando(m.id)}>
                    Desativar
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>

      <form className="ong-form-section equipe-form" onSubmit={cadastrar} noValidate>
        <h2>
          <UserPlus size={20} /> Cadastrar coordenador
        </h2>
        <p className="ong-form-footnote">
          Você define a senha inicial e repassa para a pessoa. Ela entra com o e-mail e essa senha.
        </p>
        {[
          ['nome', 'Nome', 'text', 120],
          ['email', 'E-mail', 'email', 160],
          ['senha', 'Senha inicial (8 a 72 caracteres)', 'text', 72],
        ].map(([name, label, type, max]) => (
          <div className="ong-field" key={name}>
            <label htmlFor={`equipe-${name}`}>{label}</label>
            <input
              id={`equipe-${name}`}
              name={name}
              type={type}
              maxLength={max}
              value={form[name]}
              aria-invalid={!!erros[name]}
              onChange={(e) => {
                setForm({ ...form, [name]: e.target.value });
                setErros({ ...erros, [name]: undefined });
              }}
            />
            {erros[name] && <span className="ong-field-error">{erros[name]}</span>}
          </div>
        ))}
        <button className="primary-button" type="submit">
          Cadastrar coordenador
        </button>
      </form>
    </section>
  );
}

/** Quem tem vagas em andamento só sai com alguém assumindo (RN-15). */
function Desativar({ membro, opcoes, aoConfirmar, aoCancelar }) {
  const [novo, setNovo] = useState('');
  const precisa = membro.vagasEmAndamento > 0;
  return (
    <div className="equipe-desativar">
      {precisa && (
        <label>
          Quem assume as {membro.vagasEmAndamento} vaga(s)?
          <select value={novo} onChange={(e) => setNovo(e.target.value)}>
            <option value="">Escolha</option>
            {opcoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        className="primary-button"
        disabled={precisa && !novo}
        onClick={() => aoConfirmar(novo || null)}
      >
        Confirmar desativação
      </button>
      <button className="text-button" onClick={aoCancelar}>
        Voltar
      </button>
    </div>
  );
}

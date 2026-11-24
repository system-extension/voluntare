import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cadastrarCoordenador, desativarMembro, listarEquipe } from '../../api/organizacoes';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import Modal from '../../components/ui/Modal';
import Seletor from '../../components/ui/Seletor';
import useCarregar from '../../hooks/useCarregar';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';
import { ROTULO_PAPEL } from '../../utils/papeis';
import './organizacao.css';

const VAZIO = { nome: '', email: '', senha: '' };

const iniciais = (nome) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

/** Senha inicial legível (sem 0/O, 1/l), com letras e números, para o gestor repassar. */
function gerarSenha() {
  const letras = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const numeros = '23456789';
  const sorteio = (conjunto, n) =>
    Array.from(crypto.getRandomValues(new Uint32Array(n)), (v) => conjunto[v % conjunto.length]);
  return [...sorteio(letras, 7), ...sorteio(numeros, 3)].join('');
}

/** Rota /organizacao/equipe, só do gestor (RN-14 e RN-15). */
export default function Equipe() {
  useTitulo('Equipe');
  const navegar = useNavigate();
  const { usuario } = useConta();
  const equipe = useCarregar(listarEquipe);
  const [aviso, setAviso] = useState('');
  const [desativando, setDesativando] = useState(null);

  if (equipe.erro)
    return <ErroCarregamento erro={equipe.erro} aoTentarNovamente={equipe.recarregar} />;
  if (!equipe.dados) return <Carregando />;

  const membros = equipe.dados;
  const ativos = membros.filter((m) => m.ativo);
  const coordenadores = ativos.filter((m) => m.papel === 'COORDENADOR').length;

  return (
    <section className="ong-page equipe">
      <button className="text-button" onClick={() => navegar('/organizacao')}>
        <ArrowLeft size={17} /> Voltar às vagas
      </button>
      <div className="ong-heading">
        <div>
          <div className="ong-eyebrow">Área da organização</div>
          <h1>Equipe</h1>
          <p>
            Gestores administram a organização. Coordenadores criam e acompanham as próprias vagas,
            aceitam candidatos e registram a presença.
          </p>
        </div>
      </div>

      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} /> {aviso}
        </p>
      )}

      <div className="equipe-layout">
        <div>
          <div className="equipe-resumo">
            <UsersRound size={18} aria-hidden="true" />
            {ativos.length} {ativos.length === 1 ? 'pessoa ativa' : 'pessoas ativas'} ·{' '}
            {coordenadores} {coordenadores === 1 ? 'coordenador' : 'coordenadores'}
          </div>
          <ul className="equipe-lista">
            {membros.map((m) => (
              <li key={m.id} className={`equipe-membro ${m.ativo ? '' : 'equipe-inativo'}`}>
                <span className="equipe-avatar" aria-hidden="true">
                  {iniciais(m.nome)}
                </span>
                <div className="equipe-dados">
                  <strong>
                    {m.nome}
                    {m.id === usuario?.id && <span className="equipe-voce">você</span>}
                  </strong>
                  <span>{m.email}</span>
                  <span className="equipe-vagas">
                    {m.vagasEmAndamento === 0
                      ? 'Nenhuma vaga em andamento'
                      : m.vagasEmAndamento === 1
                        ? '1 vaga em andamento'
                        : `${m.vagasEmAndamento} vagas em andamento`}
                  </span>
                </div>
                <span
                  className={`ong-status ${
                    !m.ativo ? 'cancelled' : m.papel === 'GESTOR' ? 'active' : 'draft'
                  }`}
                >
                  {m.ativo ? ROTULO_PAPEL[m.papel] : 'Desativado'}
                </span>
                {m.ativo && m.papel === 'COORDENADOR' && (
                  <button
                    className="ong-outline-button equipe-desativar-botao"
                    onClick={() => setDesativando(m)}
                  >
                    Desativar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <NovoCoordenador
          aoCadastrar={(novo) => {
            setAviso(
              `${novo.nome} foi cadastrado. Passe o e-mail e a senha inicial para a pessoa entrar.`,
            );
            equipe.recarregar();
          }}
        />
      </div>

      {desativando && (
        <Desativar
          membro={desativando}
          opcoes={ativos.filter((a) => a.id !== desativando.id)}
          aoFechar={() => setDesativando(null)}
          aoConcluir={() => {
            setAviso(`${desativando.nome} foi desativado e não consegue mais entrar.`);
            setDesativando(null);
            equipe.recarregar();
          }}
        />
      )}
    </section>
  );
}

/** Cadastro de coordenador com senha inicial definida pelo gestor (RN-14). */
function NovoCoordenador({ aoCadastrar }) {
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const alterar = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErros((e) => ({ ...e, [name]: undefined }));
  };

  function validar() {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Informe um e-mail válido.';
    if (form.senha.length < 8 || form.senha.length > 72)
      e.senha = 'A senha inicial precisa ter de 8 a 72 caracteres.';
    return e;
  }

  async function cadastrar(e) {
    e.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    setErro('');
    if (Object.keys(encontrados).length) return;
    setEnviando(true);
    try {
      const novo = await cadastrarCoordenador({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });
      setForm(VAZIO);
      setMostrarSenha(false);
      aoCadastrar(novo);
    } catch (falha) {
      const campos = Object.fromEntries((falha.campos ?? []).map((c) => [c.campo, c.mensagem]));
      setErros(campos);
      setErro(Object.keys(campos).length ? '' : falha.message);
    } finally {
      setEnviando(false);
    }
  }

  const campo = (name, label, props = {}) => (
    <div className="ong-field">
      <label htmlFor={`equipe-${name}`}>{label}</label>
      {props.children ?? (
        <input
          id={`equipe-${name}`}
          value={form[name]}
          aria-invalid={!!erros[name]}
          aria-describedby={erros[name] ? `equipe-${name}-erro` : undefined}
          onChange={(e) => alterar(name, e.target.value)}
          {...props}
        />
      )}
      {erros[name] && (
        <span className="ong-field-error" id={`equipe-${name}-erro`}>
          {erros[name]}
        </span>
      )}
    </div>
  );

  return (
    <form className="equipe-card" onSubmit={cadastrar} noValidate>
      <h2>
        <UserPlus size={20} aria-hidden="true" /> Adicionar coordenador
      </h2>
      <p className="ong-form-footnote">
        Você define uma senha inicial e repassa para a pessoa. Ela entra com o e-mail e essa senha.
      </p>
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      {campo('nome', 'Nome completo', { maxLength: 120, autoComplete: 'off' })}
      {campo('email', 'E-mail', { type: 'email', maxLength: 160, autoComplete: 'off' })}
      {campo('senha', 'Senha inicial', {
        children: (
          <>
            <div className="equipe-senha">
              <input
                id="equipe-senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={72}
                value={form.senha}
                aria-invalid={!!erros.senha}
                aria-describedby={erros.senha ? 'equipe-senha-erro' : 'equipe-senha-dica'}
                onChange={(e) => alterar('senha', e.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={mostrarSenha ? 'Esconder a senha' : 'Mostrar a senha'}
                aria-pressed={mostrarSenha}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            <div className="equipe-senha-acoes">
              <span className="ong-field-hint" id="equipe-senha-dica">
                De 8 a 72 caracteres.
              </span>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  alterar('senha', gerarSenha());
                  setMostrarSenha(true);
                }}
              >
                <RefreshCw size={15} /> Gerar senha
              </button>
            </div>
          </>
        ),
      })}
      <button className="primary-button full-width" type="submit" disabled={enviando}>
        {enviando ? 'Cadastrando…' : 'Cadastrar coordenador'}
      </button>
    </form>
  );
}

/** Desativação em uma janela; quem tem vagas em andamento só sai com alguém assumindo (RN-15). */
function Desativar({ membro, opcoes, aoFechar, aoConcluir }) {
  const [novo, setNovo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const precisa = membro.vagasEmAndamento > 0;

  async function confirmar() {
    setEnviando(true);
    setErro('');
    try {
      await desativarMembro(membro.id, novo || null);
      aoConcluir();
    } catch (falha) {
      // o backend aponta o campo novoResponsavelId quando falta quem assuma as vagas
      const campo = (falha.campos ?? []).find((c) => c.campo === 'novoResponsavelId');
      setErro(campo?.mensagem ?? falha.message);
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={`Desativar ${membro.nome}?`} aoFechar={aoFechar}>
      <p>
        A pessoa deixa de conseguir entrar no Voluntare. O histórico das vagas e das presenças que
        ela registrou continua guardado.
      </p>
      {precisa && (
        <div className="ong-field">
          <label htmlFor="equipe-novo-responsavel">
            Quem assume{' '}
            {membro.vagasEmAndamento === 1 ? 'a vaga' : `as ${membro.vagasEmAndamento} vagas`} em
            andamento?
          </label>
          <Seletor
            id="equipe-novo-responsavel"
            opcoes={opcoes.map((o) => ({
              valor: o.id,
              rotulo: `${o.nome} (${ROTULO_PAPEL[o.papel].toLowerCase()})`,
            }))}
            valor={novo}
            textoVazio="Escolha uma pessoa"
            aoMudar={setNovo}
          />
        </div>
      )}
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      <button
        className="primary-button full-width"
        disabled={enviando || (precisa && !novo)}
        onClick={confirmar}
      >
        {enviando ? 'Desativando…' : 'Confirmar desativação'}
      </button>
      <button className="text-button full-width" onClick={aoFechar}>
        Voltar
      </button>
    </Modal>
  );
}

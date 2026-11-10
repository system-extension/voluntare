import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UFS } from '../../api/rotulos';
import Seletor from '../../components/ui/Seletor';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';
import { inicioDoPapel } from '../../utils/papeis';
import { Campo, CampoSenha } from './CamposAcesso';

/**
 * Três etapas curtas em vez de um formulário longo. Os campos de cada uma usam a chave que o
 * backend devolve em `campos` ("organizacao.nome", "gestor.senha"): assim um erro do servidor
 * leva a pessoa direto para a etapa e o campo certos.
 */
const ETAPAS = [
  {
    nome: 'Organização',
    titulo: 'Qual é a sua organização?',
    subtitulo: 'É assim que os voluntários vão encontrar a ONG.',
    campos: ['organizacao.nome', 'organizacao.cidade', 'organizacao.uf'],
  },
  {
    nome: 'Contato',
    titulo: 'Como falar com a organização?',
    subtitulo: 'Esses dados aparecem para os voluntários.',
    campos: ['organizacao.email', 'organizacao.telefone', 'organizacao.descricao'],
  },
  {
    nome: 'Seu acesso',
    titulo: 'Crie o seu acesso de gestor',
    subtitulo: 'Você vai administrar a organização e as vagas.',
    campos: ['gestor.nome', 'gestor.email', 'gestor.senha'],
  },
];

const OPCOES_UF = UFS.map((uf) => ({ valor: uf }));

const emailValido = (email) => /^\S+@\S+\.\S+$/.test(email.trim());

/** Mesmas regras do CadastroOrganizacaoRequest. */
function validar(d) {
  const erros = {};
  const exigir = (chave, rotulo, max) => {
    const valor = d[chave].trim();
    if (!valor) erros[chave] = `Informe ${rotulo}.`;
    else if (valor.length > max) erros[chave] = `Use até ${max} caracteres.`;
  };
  exigir('organizacao.nome', 'o nome da organização', 150);
  exigir('organizacao.cidade', 'a cidade', 100);
  if (!d['organizacao.uf']) erros['organizacao.uf'] = 'Escolha o estado.';

  if (!d['organizacao.email'].trim()) erros['organizacao.email'] = 'Informe o e-mail de contato.';
  else if (!emailValido(d['organizacao.email']))
    erros['organizacao.email'] = 'Informe um e-mail válido.';
  if (d['organizacao.telefone'].trim().length > 20)
    erros['organizacao.telefone'] = 'Use até 20 caracteres.';
  if (d['organizacao.descricao'].trim().length > 2000)
    erros['organizacao.descricao'] = 'Use até 2000 caracteres.';

  exigir('gestor.nome', 'o seu nome', 120);
  if (!d['gestor.email'].trim()) erros['gestor.email'] = 'Informe o seu e-mail.';
  else if (!emailValido(d['gestor.email'])) erros['gestor.email'] = 'Informe um e-mail válido.';
  if (d['gestor.senha'].length < 8 || d['gestor.senha'].length > 72)
    erros['gestor.senha'] = 'A senha precisa ter de 8 a 72 caracteres.';
  return erros;
}

/** Primeira etapa que tem algum dos campos com erro (ou -1). */
const etapaDoErro = (erros) => ETAPAS.findIndex((e) => e.campos.some((c) => erros[c]));

/** Monta o corpo do POST: texto sem espaços nas pontas e opcionais vazios como null. */
function paraApi(d) {
  const t = (chave) => d[chave].trim();
  return {
    organizacao: {
      nome: t('organizacao.nome'),
      cidade: t('organizacao.cidade'),
      uf: d['organizacao.uf'],
      email: t('organizacao.email'),
      telefone: t('organizacao.telefone') || null,
      descricao: t('organizacao.descricao') || null,
    },
    gestor: { nome: t('gestor.nome'), email: t('gestor.email'), senha: d['gestor.senha'] },
  };
}

/** 409 vem só com mensagem: decide em qual campo mostrar. */
function campoDoConflito(mensagem) {
  if (/organiza/i.test(mensagem)) return 'organizacao.nome';
  if (/e-mail/i.test(mensagem)) return 'gestor.email';
  return null;
}

/**
 * Rota /cadastro-organizacao: cria a ONG e o gestor de uma vez (o backend grava os dois na
 * mesma transação) e já entra como gestor. O e-mail pode vir da tela de acesso (state.email).
 */
export default function CadastroOrganizacao() {
  useTitulo('Cadastrar organização');
  const { usuario, cadastrarOng } = useConta();
  const navegar = useNavigate();
  const { state } = useLocation();

  const [etapa, setEtapa] = useState(0);
  const [dados, setDados] = useState({
    'organizacao.nome': '',
    'organizacao.cidade': '',
    'organizacao.uf': '',
    'organizacao.email': '',
    'organizacao.telefone': '',
    'organizacao.descricao': '',
    'gestor.nome': '',
    'gestor.email': state?.email ?? '',
    'gestor.senha': '',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario && !enviando) return <Navigate to={inicioDoPapel(usuario)} replace />;

  const atual = ETAPAS[etapa];
  const ultima = etapa === ETAPAS.length - 1;

  const ligar = (chave) => ({
    value: dados[chave],
    onChange: (e) => {
      setDados((d) => ({ ...d, [chave]: e.target.value }));
      if (erros[chave]) setErros((er) => ({ ...er, [chave]: undefined }));
    },
  });

  const irPara = (indice) => {
    setEtapa(indice);
    setErroGeral('');
  };

  async function avancar(e) {
    e.preventDefault();
    const todos = validar(dados);
    // Até a etapa atual: as próximas ainda não foram preenchidas.
    const ate = ETAPAS.slice(0, etapa + 1).flatMap((et) => et.campos);
    const encontrados = Object.fromEntries(Object.entries(todos).filter(([c]) => ate.includes(c)));
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      irPara(etapaDoErro(encontrados));
      return;
    }
    if (!ultima) {
      irPara(etapa + 1);
      return;
    }

    setEnviando(true);
    setErroGeral('');
    try {
      await cadastrarOng(paraApi(dados));
      navegar('/organizacao', { replace: true });
    } catch (erro) {
      const porCampo = Object.fromEntries((erro.campos ?? []).map((c) => [c.campo, c.mensagem]));
      const conflito = erro.status === 409 && campoDoConflito(erro.message);
      if (conflito) porCampo[conflito] = erro.message;
      setErros(porCampo);
      setDados((d) => ({ ...d, 'gestor.senha': '' }));
      setEnviando(false);
      const indice = etapaDoErro(porCampo);
      if (indice >= 0) setEtapa(indice);
      else setErroGeral(erro.message);
    }
  }

  const campoTexto = (chave, rotulo, props = {}, extra = {}) => (
    <Campo id={idDe(chave)} rotulo={rotulo} erro={erros[chave]} {...extra}>
      {(attrs) => <input {...attrs} {...ligar(chave)} {...props} />}
    </Campo>
  );

  return (
    <section className="acesso-cartao" aria-labelledby="titulo-ong">
      <Progresso etapa={etapa} aoVoltarPara={irPara} />

      <h1 id="titulo-ong">{atual.titulo}</h1>
      <p className="acesso-subtitulo">{atual.subtitulo}</p>

      {erroGeral && (
        <div className="acesso-erro" role="alert">
          {erroGeral}
        </div>
      )}

      {/* key: cada etapa monta de novo, e o autoFocus leva ao primeiro campo dela. */}
      <form key={etapa} onSubmit={avancar} noValidate>
        {etapa === 0 && (
          <>
            {campoTexto('organizacao.nome', 'Nome da organização', {
              autoComplete: 'organization',
              maxLength: 150,
              autoFocus: true,
            })}
            <div className="acesso-linha">
              {campoTexto('organizacao.cidade', 'Cidade', {
                autoComplete: 'address-level2',
                maxLength: 100,
              })}
              <Campo id={idDe('organizacao.uf')} rotulo="Estado" erro={erros['organizacao.uf']}>
                {(attrs) => (
                  <Seletor
                    {...attrs}
                    opcoes={OPCOES_UF}
                    valor={dados['organizacao.uf']}
                    textoVazio="UF"
                    aoMudar={(uf) => {
                      setDados((d) => ({ ...d, 'organizacao.uf': uf }));
                      setErros((er) => ({ ...er, 'organizacao.uf': undefined }));
                    }}
                  />
                )}
              </Campo>
            </div>
          </>
        )}

        {etapa === 1 && (
          <>
            {campoTexto(
              'organizacao.email',
              'E-mail de contato',
              { type: 'email', maxLength: 160, autoFocus: true },
              { dica: 'Pode ser diferente do e-mail que você usa para entrar.' },
            )}
            {campoTexto(
              'organizacao.telefone',
              'Telefone',
              { type: 'tel', autoComplete: 'tel', maxLength: 20 },
              { opcional: true },
            )}
            <Campo
              id={idDe('organizacao.descricao')}
              rotulo="Descrição"
              erro={erros['organizacao.descricao']}
              dica={`${dados['organizacao.descricao'].length}/2000 · a causa, quem vocês atendem e onde atuam.`}
              opcional
            >
              {(attrs) => (
                <textarea
                  {...attrs}
                  rows={4}
                  maxLength={2000}
                  {...ligar('organizacao.descricao')}
                />
              )}
            </Campo>
          </>
        )}

        {etapa === 2 && (
          <>
            {campoTexto('gestor.nome', 'Seu nome completo', {
              autoComplete: 'name',
              maxLength: 120,
              autoFocus: true,
            })}
            {campoTexto(
              'gestor.email',
              'Seu e-mail',
              { type: 'email', autoComplete: 'email', maxLength: 160 },
              { dica: 'É com ele que você entra no Voluntare.' },
            )}
            <CampoSenha
              id={idDe('gestor.senha')}
              rotulo="Crie uma senha"
              valor={dados['gestor.senha']}
              aoAlterar={ligar('gestor.senha').onChange}
              erro={erros['gestor.senha']}
              dica="De 8 a 72 caracteres."
              novaSenha
              semFoco
            />
          </>
        )}

        <div className="acesso-navegacao">
          {etapa > 0 && (
            <button type="button" className="acesso-voltar" onClick={() => irPara(etapa - 1)}>
              <ArrowLeft size={18} /> Voltar
            </button>
          )}
          <button className="primary-button" type="submit" disabled={enviando}>
            {enviando ? 'Cadastrando…' : ultima ? 'Cadastrar organização' : 'Continuar'}{' '}
            {!enviando && <ArrowRight size={20} />}
          </button>
        </div>

        {ultima && (
          <p className="acesso-legal">
            Ao cadastrar, você concorda com os termos de uso e a política de privacidade do
            Voluntare.
          </p>
        )}
      </form>

      <p className="acesso-rodape-cartao">
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </section>
  );
}

const idDe = (chave) => `ong-${chave.replace('.', '-')}`;

/** "Etapa 2 de 3" com as etapas já feitas clicáveis para voltar. */
function Progresso({ etapa, aoVoltarPara }) {
  return (
    <nav className="acesso-progresso" aria-label="Etapas do cadastro">
      <p className="acesso-progresso-texto">
        Etapa {etapa + 1} de {ETAPAS.length}
      </p>
      <ol>
        {ETAPAS.map((e, i) => {
          const estado = i < etapa ? 'feita' : i === etapa ? 'atual' : 'futura';
          return (
            <li key={e.nome} className={`acesso-progresso-${estado}`}>
              {estado === 'feita' ? (
                <button type="button" onClick={() => aoVoltarPara(i)}>
                  <Check size={14} /> {e.nome}
                </button>
              ) : (
                <span aria-current={estado === 'atual' ? 'step' : undefined}>{e.nome}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

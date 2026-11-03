import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { verificarEmail } from '../../api/auth';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';
import { inicioDoPapel } from '../../utils/papeis';
import { Campo, CampoSenha, EmailEscolhido } from './CamposAcesso';

/** Mesmos limites do backend (VerificacaoEmailRequest, LoginRequest, CadastroVoluntarioRequest). */
const emailValido = (email) => /^\S+@\S+\.\S+$/.test(email.trim());

const TITULOS = { email: 'Entrar ou criar conta', senha: 'Entrar', cadastro: 'Criar conta' };

/** Converte o erro da API em { erros por campo, mensagem geral }. */
function lerErro(erro) {
  const campos = Object.fromEntries((erro.campos ?? []).map((c) => [c.campo, c.mensagem]));
  return { campos, geral: Object.keys(campos).length ? '' : erro.message };
}

/**
 * Rota /entrar, em três etapas na mesma tela (D-25):
 *   email    → pergunta ao backend se o e-mail já tem conta
 *   senha    → tem conta: login
 *   cadastro → não tem: cria a conta de voluntário (o cadastro da ONG tem tela própria)
 * Depois de entrar, volta para a tela que pediu o login (state.de) ou para o início do papel.
 */
export default function Entrar() {
  const { usuario, entrar, cadastrar } = useConta();
  const navegar = useNavigate();
  const { state } = useLocation();

  const [etapa, setEtapa] = useState('email');
  const [dados, setDados] = useState({ email: '', senha: '', nome: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  useTitulo(TITULOS[etapa]);

  // Já está logado (ex.: digitou /entrar na barra): não mostra o formulário.
  if (usuario && !enviando) return <Navigate to={inicioDoPapel(usuario)} replace />;

  const alterar = (campo) => (e) => {
    setDados((atual) => ({ ...atual, [campo]: e.target.value }));
    if (erros[campo]) setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  const irPara = (proxima) => {
    setEtapa(proxima);
    setErros({});
    setErroGeral('');
    setDados((atual) => ({ ...atual, senha: '' }));
  };

  /** Valida no navegador; se passar, chama a API e trata o erro do mesmo jeito em toda etapa. */
  async function enviar(e, validar, acao) {
    e.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    setErroGeral('');
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      await acao();
    } catch (erro) {
      const { campos, geral } = lerErro(erro);
      setErros(campos);
      setErroGeral(geral);
      setDados((atual) => ({ ...atual, senha: '' }));
      setEnviando(false);
    }
  }

  const concluir = (logado) => {
    const de = state?.de;
    navegar(de ? `${de.pathname}${de.search ?? ''}` : inicioDoPapel(logado), { replace: true });
  };

  const continuarComEmail = (e) =>
    enviar(
      e,
      () => {
        if (!dados.email.trim()) return { email: 'Informe o e-mail.' };
        if (!emailValido(dados.email)) return { email: 'Informe um e-mail válido.' };
        return {};
      },
      async () => {
        const { existe } = await verificarEmail(dados.email.trim());
        setEnviando(false);
        irPara(existe ? 'senha' : 'cadastro');
      },
    );

  const entrarComSenha = (e) =>
    enviar(
      e,
      () => (dados.senha ? {} : { senha: 'Informe a senha.' }),
      async () => concluir(await entrar(dados.email, dados.senha)),
    );

  const criarConta = (e) =>
    enviar(
      e,
      () => {
        const encontrados = {};
        if (!dados.nome.trim()) encontrados.nome = 'Informe o nome.';
        else if (dados.nome.trim().length > 120)
          encontrados.nome = 'O nome pode ter até 120 caracteres.';
        if (dados.senha.length < 8 || dados.senha.length > 72)
          encontrados.senha = 'A senha precisa ter de 8 a 72 caracteres.';
        return encontrados;
      },
      async () => concluir(await cadastrar(dados)),
    );

  const trocarEmail = () => irPara('email');
  // `vazio`: campo único ainda sem nada digitado. O botão fica apagado até a pessoa preencher,
  // deixando claro o que falta antes de continuar.
  const botaoEnviar = (texto, textoEnviando, vazio = false) => (
    <button className="primary-button full-width" type="submit" disabled={enviando || vazio}>
      {enviando ? textoEnviando : texto} {!enviando && <ArrowRight size={20} />}
    </button>
  );

  return (
    <section className="acesso-cartao" aria-labelledby="titulo-acesso">
      {etapa === 'email' && (
        <>
          <h1 id="titulo-acesso">Pronto para dar o próximo passo?</h1>
          <p className="acesso-subtitulo">Entre ou crie a sua conta.</p>
          <p className="acesso-legal">
            Ao continuar, você concorda com os termos de uso e a política de privacidade do
            Voluntare.
          </p>
          <BotoesSociais />
          <div className="acesso-divisor">
            <span>ou</span>
          </div>
        </>
      )}
      {etapa === 'senha' && (
        <>
          <h1 id="titulo-acesso">Que bom ver você de novo</h1>
          <EmailEscolhido email={dados.email.trim()} aoTrocar={trocarEmail} />
        </>
      )}
      {etapa === 'cadastro' && (
        <>
          <h1 id="titulo-acesso">Crie a sua conta de voluntário</h1>
          <p className="acesso-subtitulo">Ainda não há uma conta com este e-mail.</p>
          <EmailEscolhido email={dados.email.trim()} aoTrocar={trocarEmail} />
        </>
      )}

      {erroGeral && (
        <div className="acesso-erro" role="alert">
          {erroGeral}
        </div>
      )}

      {etapa === 'email' && (
        <form onSubmit={continuarComEmail} noValidate>
          <p className="acesso-obrigatorios">Todos os campos marcados com * são obrigatórios.</p>
          <Campo id="acesso-email" rotulo="Endereço de e-mail" erro={erros.email}>
            {(attrs) => (
              <input
                {...attrs}
                type="email"
                autoComplete="email"
                autoFocus
                value={dados.email}
                onChange={alterar('email')}
              />
            )}
          </Campo>
          {botaoEnviar('Continuar', 'Verificando…', !dados.email.trim())}
        </form>
      )}

      {etapa === 'senha' && (
        <form onSubmit={entrarComSenha} noValidate>
          <CampoSenha
            id="acesso-senha"
            valor={dados.senha}
            aoAlterar={alterar('senha')}
            erro={erros.senha}
          />
          {botaoEnviar('Entrar', 'Entrando…', !dados.senha)}
        </form>
      )}

      {etapa === 'cadastro' && (
        <form onSubmit={criarConta} noValidate>
          <Campo id="acesso-nome" rotulo="Nome completo" erro={erros.nome}>
            {(attrs) => (
              <input
                {...attrs}
                autoComplete="name"
                autoFocus
                maxLength={120}
                value={dados.nome}
                onChange={alterar('nome')}
              />
            )}
          </Campo>
          <CampoSenha
            id="acesso-nova-senha"
            rotulo="Crie uma senha"
            valor={dados.senha}
            aoAlterar={alterar('senha')}
            erro={erros.senha}
            dica="De 8 a 72 caracteres."
            novaSenha
          />
          {botaoEnviar('Criar conta', 'Criando a conta…')}
          <p className="acesso-legal">
            Ao criar a conta, você concorda com os termos de uso e a política de privacidade do
            Voluntare.
          </p>
        </form>
      )}
    </section>
  );
}

/** Só o layout por enquanto: o login social não faz parte do MVP. */
function BotoesSociais() {
  return (
    <div className="acesso-sociais">
      {['Google', 'Apple'].map((provedor) => (
        <button
          key={provedor}
          type="button"
          className="acesso-social"
          disabled
          title="Disponível em uma próxima versão"
        >
          Continuar com {provedor} <span className="acesso-em-breve">em breve</span>
        </button>
      ))}
    </div>
  );
}

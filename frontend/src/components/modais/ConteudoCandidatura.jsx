import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { candidatar } from '../../api/candidaturas';
import useConta from '../../hooks/useConta';
import { ehDaOrganizacao } from '../../utils/papeis';

/** Conteúdo da janela "Quero me candidatar": pede login, confirma e envia (POST /candidaturas). */
export default function ConteudoCandidatura({ oportunidade, aoConcluir, fechar }) {
  const { usuario } = useConta();
  const navegar = useNavigate();
  const location = useLocation();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviada, setEnviada] = useState(false);

  const cabecalho = (
    <p>
      <strong>{oportunidade.titulo}</strong>
      <br />
      {oportunidade.organizacao.nome}
    </p>
  );

  if (!usuario) {
    return (
      <>
        {cabecalho}
        <p>Entre ou crie sua conta de voluntário para enviar a candidatura.</p>
        <button
          className="primary-button full-width"
          onClick={() => {
            fechar();
            navegar('/entrar', { state: { de: location } });
          }}
        >
          Entrar ou criar conta
        </button>
      </>
    );
  }

  if (ehDaOrganizacao(usuario)) {
    return (
      <>
        {cabecalho}
        <div className="notice">
          Você está com uma conta de organização. Só voluntários se candidatam às vagas.
        </div>
        <button className="text-button full-width" onClick={fechar}>
          Voltar
        </button>
      </>
    );
  }

  if (enviada) {
    return (
      <>
        <div className="success-icon">
          <Check />
        </div>
        <p>
          Candidatura enviada. A organização vai ver o seu perfil e responder por aqui. Acompanhe em
          Minhas vagas.
        </p>
        <button
          className="primary-button full-width"
          onClick={() => {
            fechar();
            navegar('/conta/minhas-vagas', { state: { aba: 'Candidaturas' } });
          }}
        >
          Ver minhas candidaturas
        </button>
        <button className="text-button full-width" onClick={fechar}>
          Continuar explorando
        </button>
      </>
    );
  }

  async function enviar() {
    setEnviando(true);
    setErro('');
    try {
      await candidatar(oportunidade.id);
      setEnviada(true);
      aoConcluir?.();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {cabecalho}
      <p>
        A organização vai ver o seu nome, contato, disponibilidade, habilidades e interesses.
        Enquanto ela não responder, você pode desistir em Minhas vagas.
      </p>
      {oportunidade.vagasDisponiveis <= 0 && (
        <div className="notice">
          As vagas já foram preenchidas. Sua candidatura fica na lista de espera, caso alguém
          desista.
        </div>
      )}
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      <button className="primary-button full-width" onClick={enviar} disabled={enviando}>
        <Send size={18} /> Enviar candidatura
      </button>
    </>
  );
}

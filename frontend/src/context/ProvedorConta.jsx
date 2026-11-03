import { useCallback, useEffect, useMemo, useState } from 'react';
import { cadastrarVoluntario, login, usuarioLogado } from '../api/auth';
import {
  CHAVE_SESSAO,
  EVENTO_SESSAO_EXPIRADA,
  gravarSessao,
  lerSessao,
  limparSessao,
} from '../api/sessao';
import { ContextoConta } from './contextos';

// Temporário: a tela de perfil ainda usa estes dados em memória.
// Saem quando o perfil for ligado a GET/PUT /api/voluntarios/eu.
const PERFIL_INICIAL = {
  name: 'Pessoa Voluntária',
  city: 'Sua cidade, Brasil',
  email: 'voluntario@example.com',
  about: '',
};
const PREFERENCIAS_INICIAIS = {
  visible: true,
  ready: false,
  values: {
    Causas: 'Educação',
    'Horário disponível': 'Fins de semana',
    'Formato da vaga': 'Remoto',
    'Tempo de dedicação': '2 horas por semana',
    Deslocamento: 'Até 10 km',
  },
};

/** Sessão real (token JWT do backend) disponível para todas as telas via useConta(). */
export default function ProvedorConta({ children }) {
  const [sessao, setSessao] = useState(lerSessao);
  const [perfil, setPerfil] = useState(PERFIL_INICIAL);
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_INICIAIS);

  // Login e cadastro devolvem a mesma resposta ({ token, expiraEm, usuario }).
  const iniciar = useCallback((nova) => {
    gravarSessao(nova);
    setSessao(nova);
    return nova.usuario;
  }, []);

  const entrar = useCallback(
    async (email, senha) => iniciar(await login(email.trim(), senha)),
    [iniciar],
  );

  const cadastrar = useCallback(
    async ({ nome, email, senha }) =>
      iniciar(await cadastrarVoluntario({ nome: nome.trim(), email: email.trim(), senha })),
    [iniciar],
  );

  const sair = useCallback(() => {
    limparSessao();
    setSessao(null);
  }, []);

  // Só ao abrir o site com uma sessão salva: confere no backend se ela ainda vale
  // (conta desativada ou segredo do JWT trocado). Um 401 aqui dispara o evento abaixo.
  // Depois de um login ou cadastro não precisa: a resposta acabou de vir do backend.
  useEffect(() => {
    if (!lerSessao()) return;
    usuarioLogado()
      .then((usuario) =>
        setSessao((atual) => {
          // Conta com a mesma sessão: se a pessoa saiu ou trocou de conta enquanto isso, ignora.
          if (!atual || !usuario || atual.usuario.id !== usuario.id) return atual;
          const atualizada = { ...atual, usuario };
          gravarSessao(atualizada);
          return atualizada;
        }),
      )
      .catch(() => {
        /* sem rede: mantém a sessão; 401 já é tratado pelo evento */
      });
  }, []);

  // A API recusou o token (401) em qualquer tela.
  useEffect(() => {
    const aoExpirar = () => setSessao(null);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, []);

  // Login ou logout feito em outra aba.
  useEffect(() => {
    const aoMudarEmOutraAba = (e) => {
      if (e.key === CHAVE_SESSAO || e.key === null) setSessao(lerSessao());
    };
    window.addEventListener('storage', aoMudarEmOutraAba);
    return () => window.removeEventListener('storage', aoMudarEmOutraAba);
  }, []);

  // O token tem validade (expiraEm): ao vencer, desloga sem esperar um 401.
  const expiraEm = sessao?.expiraEm;
  useEffect(() => {
    if (!expiraEm) return;
    const restante = new Date(expiraEm) - Date.now();
    // setTimeout aceita no máximo ~24,8 dias; a validade é de horas.
    const timer = setTimeout(sair, Math.max(restante, 0));
    return () => clearTimeout(timer);
  }, [expiraEm, sair]);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario ?? null,
      logado: sessao !== null,
      entrar,
      cadastrar,
      sair,
      perfil,
      setPerfil,
      preferencias,
      setPreferencias,
    }),
    [sessao, entrar, cadastrar, sair, perfil, preferencias],
  );

  return <ContextoConta.Provider value={valor}>{children}</ContextoConta.Provider>;
}

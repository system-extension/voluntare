/**
 * Sessão do usuário logado, guardada no localStorage: vale em todas as abas e sobrevive
 * a fechar o navegador, até o token vencer (8h, definido pelo backend).
 *
 * Formato: { token, expiraEm, usuario } — o mesmo que POST /api/auth/login devolve.
 */
const CHAVE = 'voluntare-sessao';

/** Avisado quando a API recusa o token (401): o provedor da conta desloga. */
export const EVENTO_SESSAO_EXPIRADA = 'voluntare:sessao-expirada';

const venceu = (sessao) => new Date(sessao.expiraEm) <= new Date();

/** Devolve a sessão salva ou null (também quando já venceu). */
export function lerSessao() {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE));
    if (sessao?.token && sessao.usuario && !venceu(sessao)) return sessao;
  } catch {
    /* JSON quebrado ou armazenamento bloqueado: trata como sem sessão */
  }
  limparSessao();
  return null;
}

export function gravarSessao(sessao) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
  } catch {
    /* modo privado: a sessão vale só enquanto a página estiver aberta */
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a limpar */
  }
}

export const tokenAtual = () => lerSessao()?.token ?? null;

/** Para ouvir login/logout feitos em outra aba (evento "storage" do navegador). */
export const CHAVE_SESSAO = CHAVE;

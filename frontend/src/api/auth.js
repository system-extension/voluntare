/** Autenticação (AuthController): /api/auth/... */
import { requisicao } from './cliente';

/**
 * 1º passo da tela de acesso: o e-mail já tem conta? (D-25)
 * @returns {Promise<{existe: boolean}>}
 */
export function verificarEmail(email) {
  return requisicao('/api/auth/verificar-email', { metodo: 'POST', corpo: { email } });
}

/** @returns {Promise<{token: string, expiraEm: string, usuario: object}>} */
export function login(email, senha) {
  return requisicao('/api/auth/login', { metodo: 'POST', corpo: { email, senha } });
}

/** Autocadastro do voluntário. Já devolve a sessão, como o login. */
export function cadastrarVoluntario({ nome, email, senha }) {
  return requisicao('/api/auth/cadastro', { metodo: 'POST', corpo: { nome, email, senha } });
}

/** Confere no banco quem é o dono do token (conta desativada depois do login cai aqui). */
export function usuarioLogado() {
  return requisicao('/api/auth/eu');
}

/**
 * Único ponto que faz fetch para o backend. Os outros arquivos de src/api só dizem o caminho
 * ("/api/auth/login"); o endereço do servidor vem de config.js e o token, de sessao.js.
 * Erros vêm no formato padrão da API (docs/arquitetura.md): status, mensagem e campos.
 */
import { URL_API } from './config';
import { EVENTO_SESSAO_EXPIRADA, limparSessao, tokenAtual } from './sessao';

export class ErroApi extends Error {
  constructor(status, mensagem, campos = []) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.campos = campos;
  }
}

/** Monta "?chave=valor" ignorando filtros vazios. */
export function query(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.set(chave, valor);
  });
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

export async function requisicao(caminho, { metodo = 'GET', corpo } = {}) {
  const token = tokenAtual();
  let resposta;
  try {
    resposta = await fetch(URL_API + caminho, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // fetch só rejeita quando não há resposta: backend fora do ar ou sem rede.
    throw new ErroApi(0, 'Não foi possível falar com o servidor. Verifique a conexão.');
  }

  // Token vencido ou recusado: a sessão local não vale mais.
  // Sem token (ex.: senha errada no login) o 401 é só um erro comum.
  if (resposta.status === 401 && token) {
    limparSessao();
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    // Resposta sem o JSON padrão (ErroResponse) não veio dos nossos controllers:
    // foi um proxy, um filtro antes do Spring MVC (ex.: CORS) ou o servidor fora do ar.
    if (!dados?.mensagem)
      console.error(`[api] ${metodo} ${caminho} → ${resposta.status} sem corpo padrão`);
    throw new ErroApi(
      resposta.status,
      dados?.mensagem ?? mensagemSemCorpo(resposta.status),
      dados?.campos ?? [],
    );
  }
  return dados;
}

function mensagemSemCorpo(status) {
  if (status >= 500)
    return 'O servidor está indisponível no momento. Tente novamente em instantes.';
  return `Não foi possível concluir a operação (erro ${status}). Tente novamente.`;
}

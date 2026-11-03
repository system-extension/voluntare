/**
 * Único ponto que faz fetch para o backend.
 * Erros vêm no formato padrão da API (docs/arquitetura.md): status, mensagem e campos.
 */

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
  const token = sessionStorage.getItem('voluntare-token');
  const resposta = await fetch(caminho, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ErroApi(
      resposta.status,
      dados?.mensagem ?? 'Não foi possível concluir a operação. Tente novamente.',
      dados?.campos ?? [],
    );
  }
  return dados;
}

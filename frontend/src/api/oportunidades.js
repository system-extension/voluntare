/**
 * Oportunidades de voluntariado.
 * Os endereços /api/... são a proposta de contrato com o backend (épicos E3 e E7).
 */
import { USAR_API_REAL } from './config';
import { requisicao, query } from './cliente';
import * as banco from './mock/banco';

const recentesPrimeiro = (a, b) => new Date(b.criadoEm) - new Date(a.criadoEm);

/**
 * Busca pública: só oportunidades abertas.
 * @param {{texto?: string, local?: string, causa?: string, organizacaoId?: number, pagina?: number, tamanho?: number}} filtros
 * @returns {Promise<{itens: object[], pagina: number, tamanho: number, total: number, totalPaginas: number}>}
 */
export async function listarOportunidades(filtros = {}) {
  if (USAR_API_REAL) return requisicao('/api/oportunidades' + query(filtros));
  return banco.responder(() => {
    const abertas = banco.oportunidades().filter((o) => o.status === 'ABERTA');
    const lista = banco.filtrar(abertas, filtros).sort(recentesPrimeiro).map(banco.paraResposta);
    return banco.paginar(lista, filtros.pagina, filtros.tamanho);
  });
}

export async function buscarOportunidade(id) {
  if (USAR_API_REAL) return requisicao(`/api/oportunidades/${id}`);
  return banco.responder(() => banco.paraResposta(banco.oportunidadePorId(id)));
}

/** Várias de uma vez (vagas salvas). Ids que não existem mais são ignorados. */
export async function buscarVarias(ids) {
  if (!ids.length) return [];
  if (USAR_API_REAL) return requisicao('/api/oportunidades' + query({ ids: ids.join(',') }));
  return banco.responder(() =>
    banco
      .oportunidades()
      .filter((o) => ids.includes(o.id))
      .map(banco.paraResposta),
  );
}

/** Área da organização: todas as oportunidades dela, em qualquer status. */
export async function listarDaMinhaOrganizacao() {
  if (USAR_API_REAL) return requisicao('/api/organizacao/oportunidades');
  return banco.responder(() => {
    const { id } = banco.organizacaoDemonstracao();
    return banco
      .oportunidades()
      .filter((o) => o.organizacaoId === id)
      .sort(recentesPrimeiro)
      .map(banco.paraResposta);
  });
}

/** Cria (sem id) ou atualiza (com id). */
export async function salvarOportunidade({ id, ...dados }) {
  if (USAR_API_REAL)
    return id
      ? requisicao(`/api/oportunidades/${id}`, { metodo: 'PUT', corpo: dados })
      : requisicao('/api/oportunidades', { metodo: 'POST', corpo: dados });
  return banco.responder(() =>
    banco.paraResposta(
      id ? banco.atualizarOportunidade(id, dados) : banco.criarOportunidade(dados),
    ),
  );
}

export async function encerrarOportunidade(id) {
  if (USAR_API_REAL) return requisicao(`/api/oportunidades/${id}/encerrar`, { metodo: 'POST' });
  return banco.responder(() => banco.paraResposta(banco.mudarStatus(id, 'ENCERRADA')));
}

export async function cancelarOportunidade(id) {
  if (USAR_API_REAL) return requisicao(`/api/oportunidades/${id}/cancelar`, { metodo: 'POST' });
  return banco.responder(() => banco.paraResposta(banco.mudarStatus(id, 'CANCELADA')));
}

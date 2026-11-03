/**
 * Oportunidades de voluntariado (OportunidadeController e GestaoOportunidadeController).
 * Os formatos de resposta seguem o OportunidadeResponse do backend.
 */
import { requisicao, query } from './cliente';

/**
 * Busca pública: só oportunidades abertas e que ainda não começaram.
 * @param {{texto?: string, local?: string, causa?: string, organizacaoId?: string, pagina?: number, tamanho?: number}} filtros
 * @returns {Promise<{itens: object[], pagina: number, tamanho: number, total: number, totalPaginas: number}>}
 */
export async function listarOportunidades(filtros = {}) {
  return requisicao('/api/oportunidades' + query(filtros));
}

export async function buscarOportunidade(id) {
  return requisicao(`/api/oportunidades/${id}`);
}

/**
 * Várias de uma vez (vagas salvas). O backend ainda não aceita o filtro "ids":
 * vai ser revisto na etapa da candidatura, que substitui as vagas salvas.
 */
export async function buscarVarias(ids) {
  if (!ids.length) return [];
  return requisicao('/api/oportunidades' + query({ ids: ids.join(',') }));
}

/** Área da organização: as oportunidades dela, em qualquer status. */
export async function listarDaMinhaOrganizacao() {
  return requisicao('/api/organizacao/oportunidades');
}

/** Cria (sem id) ou atualiza (com id). */
export async function salvarOportunidade({ id, ...dados }) {
  return id
    ? requisicao(`/api/oportunidades/${id}`, { metodo: 'PUT', corpo: dados })
    : requisicao('/api/oportunidades', { metodo: 'POST', corpo: dados });
}

export async function encerrarOportunidade(id) {
  return requisicao(`/api/oportunidades/${id}/encerrar`, { metodo: 'POST' });
}

export async function cancelarOportunidade(id) {
  return requisicao(`/api/oportunidades/${id}/cancelar`, { metodo: 'POST' });
}

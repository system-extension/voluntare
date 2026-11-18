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
 * Várias pelo id (vagas salvas). Uma chamada por vaga; as que não existem mais
 * (ou viraram rascunho) ficam de fora em vez de derrubar a lista.
 */
export async function buscarVarias(ids) {
  const respostas = await Promise.allSettled(ids.map((id) => buscarOportunidade(id)));
  return respostas.filter((r) => r.status === 'fulfilled').map((r) => r.value);
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

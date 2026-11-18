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

/** Área da organização: detalhe em qualquer status, inclusive rascunho (para editar). */
export async function buscarParaGestao(id) {
  return requisicao(`/api/organizacao/oportunidades/${id}`);
}

/** Linha do tempo dos status: quem criou e quem mudou o quê. */
export async function listarHistorico(id) {
  return requisicao(`/api/organizacao/oportunidades/${id}/historico`);
}

/** Rascunho → aberta. O backend exige o anúncio completo. */
export async function publicarOportunidade(id) {
  return requisicao(`/api/oportunidades/${id}/publicar`, { metodo: 'POST' });
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

/** O motivo é opcional e vai para o histórico. */
export async function cancelarOportunidade(id, motivo) {
  return requisicao(`/api/oportunidades/${id}/cancelar`, {
    metodo: 'POST',
    corpo: { motivo: motivo || null },
  });
}

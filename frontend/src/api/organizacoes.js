/** Organizações (nova tabela no DER). */
import { USAR_API_REAL } from './config';
import { requisicao } from './cliente';
import * as banco from './mock/banco';

export async function listarOrganizacoes() {
  if (USAR_API_REAL) return requisicao('/api/organizacoes');
  return banco.responder(() => banco.organizacoes());
}

/** Organização em nome da qual o coordenador logado publica. */
export async function buscarMinhaOrganizacao() {
  if (USAR_API_REAL) return requisicao('/api/organizacao');
  return banco.responder(() => banco.organizacaoDemonstracao());
}

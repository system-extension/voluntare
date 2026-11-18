/** Organizações. */
import { requisicao } from './cliente';

/**
 * Lista pública de organizações (modal "Avaliações de ONGs").
 * Ainda não existe no backend: a tela mostra o erro até o endpoint ser criado.
 */
export async function listarOrganizacoes() {
  return requisicao('/api/organizacoes');
}

/** Organização do gestor/coordenador logado. */
export async function buscarMinhaOrganizacao() {
  return requisicao('/api/organizacao');
}

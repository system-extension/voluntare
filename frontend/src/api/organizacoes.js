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

/** Indicadores do painel. Gestor: a organização inteira; coordenador: só as vagas dele. */
export async function buscarPainel() {
  return requisicao('/api/organizacao/painel');
}

/** Equipe (só gestor): gestores e coordenadores, com as vagas em andamento de cada um. */
export async function listarEquipe() {
  return requisicao('/api/organizacao/equipe');
}

export async function cadastrarCoordenador({ nome, email, senha }) {
  return requisicao('/api/organizacao/equipe', { metodo: 'POST', corpo: { nome, email, senha } });
}

/** Se a pessoa responde por vagas em andamento, novoResponsavelId é obrigatório (RN-15). */
export async function desativarMembro(id, novoResponsavelId) {
  return requisicao(`/api/organizacao/equipe/${id}/desativar`, {
    metodo: 'POST',
    corpo: { novoResponsavelId: novoResponsavelId || null },
  });
}

/** Candidaturas (CandidaturaController). */
import { requisicao } from './cliente';

// voluntário

export function candidatar(oportunidadeId) {
  return requisicao(`/api/oportunidades/${oportunidadeId}/candidaturas`, { metodo: 'POST' });
}

/** Das mais recentes para as mais antigas, com a participação quando aceita. */
export function listarMinhasCandidaturas() {
  return requisicao('/api/candidaturas/minhas');
}

/** Pendente: retira a candidatura. Aceita: cancela a participação (prazo de 48h, RN-43). */
export function desistir(candidaturaId) {
  return requisicao(`/api/candidaturas/${candidaturaId}/cancelar`, { metodo: 'POST' });
}

// organização

export function listarCandidatos(oportunidadeId) {
  return requisicao(`/api/organizacao/oportunidades/${oportunidadeId}/candidaturas`);
}

export function aceitar(candidaturaId) {
  return requisicao(`/api/candidaturas/${candidaturaId}/aceitar`, { metodo: 'POST' });
}

export function rejeitar(candidaturaId, motivo) {
  return requisicao(`/api/candidaturas/${candidaturaId}/rejeitar`, {
    metodo: 'POST',
    corpo: { motivo: motivo || null },
  });
}

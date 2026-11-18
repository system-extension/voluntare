/** Participações (ParticipacaoController). */
import { requisicao } from './cliente';

/** Histórico do voluntário: { totalHoras, presencas, participacoes } */
export function listarMinhasParticipacoes() {
  return requisicao('/api/participacoes/minhas');
}

/** Registro definitivo (RN-57), só depois do fim da atividade. */
export function registrarPresenca(participacaoId, horas, observacao) {
  return requisicao(`/api/participacoes/${participacaoId}/presenca`, {
    metodo: 'POST',
    corpo: { horas, observacao: observacao || null },
  });
}

export function registrarAusencia(participacaoId, motivo) {
  return requisicao(`/api/participacoes/${participacaoId}/ausencia`, {
    metodo: 'POST',
    corpo: { motivo: motivo || null },
  });
}

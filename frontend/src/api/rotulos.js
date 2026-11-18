/**
 * Tradução dos códigos do backend (enums) para o texto que aparece na tela.
 * Um lugar só: se o backend mudar um nome, muda aqui.
 */

export const CAUSAS = [
  { valor: 'EDUCACAO', rotulo: 'Educação' },
  { valor: 'MEIO_AMBIENTE', rotulo: 'Meio ambiente' },
  { valor: 'ASSISTENCIA_SOCIAL', rotulo: 'Assistência social' },
  { valor: 'ANIMAIS', rotulo: 'Animais' },
  { valor: 'COMUNICACAO', rotulo: 'Comunicação' },
];

/** `classe` reaproveita os estilos de status da área da organização. */
export const STATUS_OPORTUNIDADE = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho', plural: 'Rascunhos', classe: 'draft' },
  { valor: 'ABERTA', rotulo: 'Aberta', plural: 'Abertas', classe: 'active' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada', plural: 'Encerradas', classe: 'closed' },
  { valor: 'CANCELADA', rotulo: 'Cancelada', plural: 'Canceladas', classe: 'cancelled' },
];

export const STATUS_CANDIDATURA = [
  { valor: 'PENDENTE', rotulo: 'Aguardando a organização', classe: 'pending' },
  { valor: 'ACEITA', rotulo: 'Aceita', classe: 'active' },
  { valor: 'REJEITADA', rotulo: 'Não aceita', classe: 'cancelled' },
  { valor: 'CANCELADA', rotulo: 'Você desistiu', classe: 'closed' },
];

export const STATUS_PARTICIPACAO = [
  { valor: 'CONFIRMADA', rotulo: 'Confirmada', classe: 'active' },
  { valor: 'PRESENTE', rotulo: 'Presente', classe: 'active' },
  { valor: 'AUSENTE', rotulo: 'Ausente', classe: 'cancelled' },
  { valor: 'CANCELADA', rotulo: 'Desistência (vaga devolvida)', classe: 'closed' },
  { valor: 'CANCELADA_TARDIA', rotulo: 'Desistência fora do prazo', classe: 'cancelled' },
];

export const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
];

/** Busca o rótulo de um código numa das listas acima. */
export const rotulo = (lista, valor) => lista.find((i) => i.valor === valor)?.rotulo ?? valor ?? '';

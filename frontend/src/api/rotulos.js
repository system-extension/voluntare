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
  { valor: 'ABERTA', rotulo: 'Aberta', plural: 'Abertas', classe: 'active' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada', plural: 'Encerradas', classe: 'closed' },
  { valor: 'CANCELADA', rotulo: 'Cancelada', plural: 'Canceladas', classe: 'cancelled' },
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

/** Minúsculas e sem acentos, para comparar textos na busca. */
export const normalizar = (valor = '') =>
  String(valor).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

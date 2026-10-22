/** Endereço da busca com os filtros na URL (dá para compartilhar e usar o voltar do navegador). */
export function caminhoBusca({ texto = '', local = '', causa = '', pagina = 1 } = {}) {
  const params = new URLSearchParams();
  if (texto) params.set('q', texto);
  if (local) params.set('l', local);
  if (causa) params.set('causa', causa);
  if (pagina > 1) params.set('pagina', String(pagina));
  const query = params.toString();
  return `/oportunidades${query ? `?${query}` : ''}`;
}

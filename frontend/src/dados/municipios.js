/**
 * Municípios do Brasil por UF ({ "SC": ["Abdon Batista", ...] }), na grafia oficial do IBGE (2026).
 * Fonte: tabela de municípios do IBGE, extraída do pacote @br-geo-kit/ibge (licença MIT).
 *
 * O JSON (~85 KB, ~29 KB compactado) fica no projeto para funcionar sem depender de API externa,
 * e só é baixado quando alguma tela pede (import dinâmico vira um arquivo separado no build).
 */
import { useEffect, useState } from 'react';
import { normalizar } from '../utils/texto';

let cache = null;
let carregando = null;

export function carregarMunicipios() {
  if (cache) return Promise.resolve(cache);
  carregando ??= import('./municipios.json').then((m) => (cache = m.default));
  return carregando;
}

/** { SC: [...], ... } depois de carregado; null enquanto carrega. */
export function useMunicipios() {
  const [dados, setDados] = useState(cache);
  useEffect(() => {
    if (!dados) carregarMunicipios().then(setDados);
  }, [dados]);
  return dados;
}

/** Nome oficial da cidade na UF (ignorando acento e maiúsculas), ou null se não existir. */
export function cidadeOficial(municipios, uf, nome) {
  if (!municipios || !uf || !nome) return null;
  const alvo = normalizar(nome);
  return (municipios[uf] ?? []).find((c) => normalizar(c) === alvo) ?? null;
}

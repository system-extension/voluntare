import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContextoVagasSalvas } from './contextos';

const CHAVE = 'voluntare-saved';

function ler() {
  try {
    const valor = JSON.parse(localStorage.getItem(CHAVE) || '[]');
    return Array.isArray(valor) ? valor.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/** Vagas salvas pelo voluntário. Ficam só neste navegador (não fazem parte do DER). */
export default function ProvedorVagasSalvas({ children }) {
  const [salvas, setSalvas] = useState(ler);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(salvas));
    } catch {
      /* A interface continua funcionando sem armazenamento. */
    }
  }, [salvas]);

  const alternar = useCallback(
    (id) =>
      setSalvas((atual) => (atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id])),
    [],
  );
  const salvar = useCallback(
    (id) => setSalvas((atual) => (atual.includes(id) ? atual : [...atual, id])),
    [],
  );

  const valor = useMemo(
    () => ({ salvas, estaSalva: (id) => salvas.includes(id), alternar, salvar }),
    [salvas, alternar, salvar],
  );

  return <ContextoVagasSalvas.Provider value={valor}>{children}</ContextoVagasSalvas.Provider>;
}

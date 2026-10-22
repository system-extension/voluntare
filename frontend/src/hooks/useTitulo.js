import { useEffect } from 'react';

/** Título da aba do navegador: "Minhas vagas | Voluntare". */
export default function useTitulo(titulo) {
  useEffect(() => {
    document.title = `${titulo} | Voluntare`;
  }, [titulo]);
}

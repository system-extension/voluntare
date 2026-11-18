import { useContext } from 'react';
import { ContextoModal } from '../context/contextos';

/** abrir('info', { titulo }) · abrir('candidatura', { oportunidade }) · fechar() */
export default function useModal() {
  return useContext(ContextoModal);
}

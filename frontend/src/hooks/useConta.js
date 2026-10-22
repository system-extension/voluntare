import { useContext } from 'react';
import { ContextoConta } from '../context/contextos';

/** Conta de demonstração: perfil e preferências em memória (sem login real por enquanto). */
export default function useConta() {
  return useContext(ContextoConta);
}

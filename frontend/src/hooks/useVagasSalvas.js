import { useContext } from 'react';
import { ContextoVagasSalvas } from '../context/contextos';

/** { salvas: number[], estaSalva(id), alternar(id), salvar(id) } */
export default function useVagasSalvas() {
  return useContext(ContextoVagasSalvas);
}

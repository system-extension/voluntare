import { useContext } from 'react';
import { ContextoConta } from '../context/contextos';

/**
 * Sessão do usuário: { usuario, logado, entrar(email, senha), cadastrar({ nome, email, senha }), sair() }.
 * `usuario` é o UsuarioResponse do backend: id, nome, email, papel e organizacao.
 */
export default function useConta() {
  return useContext(ContextoConta);
}

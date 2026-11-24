import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import { inicioDoPapel } from '../../utils/papeis';

/**
 * Libera as rotas filhas só para quem está logado com um dos `papeis`.
 * Sem login: vai para /entrar e guarda de onde veio, para voltar depois.
 * Logado com outro papel: volta para a tela inicial do próprio papel.
 * (A segurança de verdade é o backend; isto só evita mostrar telas que dariam 401/403.)
 */
export default function RotaProtegida({ papeis }) {
  const { usuario } = useConta();
  const location = useLocation();

  if (!usuario) return <Navigate to="/entrar" replace state={{ de: location }} />;
  if (!papeis.includes(usuario.papel)) return <Navigate to={inicioDoPapel(usuario)} replace />;
  return <Outlet />;
}

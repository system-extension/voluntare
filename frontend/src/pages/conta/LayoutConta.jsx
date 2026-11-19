import { Outlet } from 'react-router-dom';
import './conta.css';

/** Área do voluntário. O acesso (só VOLUNTARIO logado) é controlado pela RotaProtegida no App. */
export default function LayoutConta() {
  return <Outlet />;
}

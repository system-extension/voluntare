import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import './conta.css';

/** Abrir qualquer tela de /conta entra na conta de demonstração (como antes). */
export default function LayoutConta() {
  const { entrar } = useConta();
  useEffect(() => {
    entrar();
  }, [entrar]);
  return <Outlet />;
}

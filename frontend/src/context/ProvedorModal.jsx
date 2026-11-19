import { useCallback, useMemo, useState } from 'react';
import GerenciadorModais from '../components/modais/GerenciadorModais';
import { ContextoModal } from './contextos';

/** Uma janela modal por vez, aberta de qualquer tela com useModal(). */
export default function ProvedorModal({ children }) {
  const [modal, setModal] = useState(null);
  const abrir = useCallback((tipo, dados = {}) => setModal({ tipo, ...dados }), []);
  const fechar = useCallback(() => setModal(null), []);
  const valor = useMemo(() => ({ abrir, fechar }), [abrir, fechar]);

  return (
    <ContextoModal.Provider value={valor}>
      {children}
      {modal && <GerenciadorModais key={modal.tipo} modal={modal} abrir={abrir} fechar={fechar} />}
    </ContextoModal.Provider>
  );
}

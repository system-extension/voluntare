import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';

/** Janela modal acessível (<dialog>): fecha no Esc, no X e clicando fora. */
export default function Modal({ titulo, children, aoFechar }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.showModal();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={aoFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" onClick={aoFechar} aria-label="Fechar">
          <X size={22} />
        </button>
        <Logo />
        <h2>{titulo}</h2>
        {children}
      </div>
    </dialog>
  );
}

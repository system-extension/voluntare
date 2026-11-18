import { useState } from 'react';

/**
 * Confirmação de uma ação que não dá para desfazer.
 * Com `pedirMotivo`, mostra um campo opcional e entrega o texto para aoConfirmar(motivo).
 */
export default function ConteudoConfirmacao({ modal, fechar }) {
  const [motivo, setMotivo] = useState('');
  return (
    <>
      <p>{modal.mensagem}</p>
      {modal.pedirMotivo && (
        <label className="modal-motivo">
          {modal.pedirMotivo}
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </label>
      )}
      <button
        className="primary-button full-width"
        onClick={() => {
          fechar();
          modal.aoConfirmar(motivo.trim());
        }}
      >
        {modal.textoConfirmar}
      </button>
      <button className="text-button full-width" onClick={fechar}>
        Voltar
      </button>
    </>
  );
}

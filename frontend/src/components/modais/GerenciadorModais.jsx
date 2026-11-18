import { useNavigate } from 'react-router-dom';
import { caminhoBusca } from '../../utils/rotas';
import Modal from '../ui/Modal';
import ConteudoCandidatura from './ConteudoCandidatura';
import ConteudoInformativo from './ConteudoInformativo';
import ConteudoOrganizacao from './ConteudoOrganizacao';

/** Decide o conteúdo da janela aberta por useModal().abrir(tipo, dados). */
export default function GerenciadorModais({ modal, abrir, fechar }) {
  const navegar = useNavigate();

  const buscar = (texto = '', local = '') => {
    fechar();
    navegar(caminhoBusca({ texto, local }));
  };

  switch (modal.tipo) {
    case 'candidatura':
      return (
        <Modal titulo="Quero me candidatar" aoFechar={fechar}>
          <ConteudoCandidatura
            oportunidade={modal.oportunidade}
            aoConcluir={modal.aoConcluir}
            fechar={fechar}
          />
        </Modal>
      );

    case 'confirmar':
      return (
        <Modal titulo={modal.titulo} aoFechar={fechar}>
          <p>{modal.mensagem}</p>
          <button
            className="primary-button full-width"
            onClick={() => {
              fechar();
              modal.aoConfirmar();
            }}
          >
            {modal.textoConfirmar}
          </button>
          <button className="text-button full-width" onClick={fechar}>
            Voltar
          </button>
        </Modal>
      );

    case 'organizacao':
      return (
        <Modal titulo={modal.organizacao.nome} aoFechar={fechar}>
          <ConteudoOrganizacao organizacao={modal.organizacao} aoBuscar={buscar} />
        </Modal>
      );

    default:
      return (
        <Modal titulo={modal.titulo} aoFechar={fechar}>
          <ConteudoInformativo
            titulo={modal.titulo}
            aoBuscar={buscar}
            aoAbrirOrganizacao={(organizacao) => abrir('organizacao', { organizacao })}
          />
        </Modal>
      );
  }
}

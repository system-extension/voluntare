import { ArrowRight, Bookmark, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import useVagasSalvas from '../../hooks/useVagasSalvas';
import { caminhoBusca } from '../../utils/rotas';
import Modal from '../ui/Modal';
import ConteudoInformativo from './ConteudoInformativo';
import ConteudoOrganizacao from './ConteudoOrganizacao';

/** Decide o conteúdo da janela aberta por useModal().abrir(tipo, dados). */
export default function GerenciadorModais({ modal, abrir, fechar }) {
  const navegar = useNavigate();
  const { entrar } = useConta();
  const { salvar } = useVagasSalvas();

  const buscar = (texto = '', local = '') => {
    fechar();
    navegar(caminhoBusca({ texto, local }));
  };

  switch (modal.tipo) {
    case 'conta':
      return (
        <Modal titulo="Seu próximo passo começa aqui" aoFechar={fechar}>
          <p>Explore as oportunidades e encontre uma causa com a qual você se identifica.</p>
          <button
            className="primary-button full-width"
            onClick={() => {
              entrar();
              fechar();
              navegar('/conta/perfil');
            }}
          >
            Entrar na demonstração <ArrowRight size={20} />
          </button>
          <button className="text-button full-width" onClick={() => buscar()}>
            Continuar sem uma conta
          </button>
        </Modal>
      );

    case 'candidatura':
      return (
        <Modal titulo="Candidatura de demonstração" aoFechar={fechar}>
          <p>
            <strong>{modal.oportunidade.titulo}</strong>
            <br />
            {modal.oportunidade.organizacao.nome}
          </p>
          <div className="notice">
            Nesta versão local, você pode salvar seu interesse neste navegador; nenhum dado ou
            candidatura será enviado à organização.
          </div>
          <button
            className="primary-button full-width"
            onClick={() => {
              salvar(modal.oportunidade.id);
              abrir('sucesso');
            }}
          >
            <Bookmark size={18} /> Salvar meu interesse
          </button>
        </Modal>
      );

    case 'sucesso':
      return (
        <Modal titulo="Vaga salva para você" aoFechar={fechar}>
          <div className="success-icon">
            <Check />
          </div>
          <p>
            Seu interesse foi salvo neste navegador. A vaga aparece com o marcador preenchido na
            lista.
          </p>
          <button className="primary-button full-width" onClick={fechar}>
            Continuar explorando
          </button>
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

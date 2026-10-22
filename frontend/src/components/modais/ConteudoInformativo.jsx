import { Check, ChevronRight } from 'lucide-react';
import { CAUSAS } from '../../api/rotulos';
import { listarOrganizacoes } from '../../api/organizacoes';
import useCarregar from '../../hooks/useCarregar';
import Carregando from '../ui/Carregando';

/** Textos das páginas informativas abertas pelo cabeçalho e pelo rodapé. */
export default function ConteudoInformativo({ titulo, aoBuscar, aoAbrirOrganizacao }) {
  switch (titulo) {
    case 'País e idioma':
      return (
        <>
          <p>Você está na versão brasileira do Voluntare.</p>
          <div className="notice inline-icon">
            <Check size={20} /> Brasil · Português (Brasil)
          </div>
        </>
      );
    case 'Privacidade':
      return (
        <>
          <p>
            Esta demonstração não envia seus dados a um servidor. Os identificadores das vagas
            salvas e os anúncios criados pela área da organização ficam no armazenamento local deste
            navegador.
          </p>
          <p>
            Você pode remover uma vaga clicando novamente no marcador ou apagar os dados do site nas
            configurações do navegador.
          </p>
        </>
      );
    case 'Termos':
      return (
        <p>
          O Voluntare está em fase de desenvolvimento. As organizações e oportunidades desta
          demonstração são fictícias. Não há inscrições reais nem pagamentos.
        </p>
      );
    case 'Causas':
      return (
        <div className="modal-links">
          {CAUSAS.map((causa) => (
            <button key={causa.valor} onClick={() => aoBuscar(causa.rotulo)}>
              {causa.rotulo}
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      );
    case 'Conheça as organizações':
      return <ListaOrganizacoes aoAbrirOrganizacao={aoAbrirOrganizacao} />;
    case 'Guia de voluntariado':
    case 'Ajuda':
      return (
        <>
          <p>
            Busque por uma atividade, uma causa ou uma organização. Você também pode escolher uma
            cidade ou um estado.
          </p>
          <p>
            Selecione uma vaga para conhecer as atividades, a data e o horário. Use o marcador para
            salvar as oportunidades de seu interesse.
          </p>
          <button className="primary-button full-width" onClick={() => aoBuscar()}>
            Pesquisar vagas
          </button>
        </>
      );
    case 'Acessibilidade no Voluntare':
      return (
        <p>
          Você pode navegar usando o teclado, acessar os campos pelos seus rótulos e ampliar a
          página. No celular, selecione uma vaga para abrir os detalhes e use “Voltar às vagas” para
          retornar à lista.
        </p>
      );
    case 'Voluntare Eventos':
      return (
        <>
          <p>Encontre mutirões, campanhas e outras ações pontuais para participar.</p>
          <button className="primary-button full-width" onClick={() => aoBuscar('mutirão')}>
            Explorar mutirões
          </button>
        </>
      );
    case 'Sobre o Voluntare':
      return (
        <>
          <p>
            Uma plataforma para aproximar pessoas, ONGs e ações sociais por meio do voluntariado.
          </p>
          <p>
            Esta é a primeira versão do frontend, com oportunidades fictícias e sem integração com
            um servidor.
          </p>
        </>
      );
    default:
      return null;
  }
}

function ListaOrganizacoes({ aoAbrirOrganizacao }) {
  const { dados, carregando } = useCarregar(listarOrganizacoes);
  return (
    <>
      <p>
        Explore as organizações fictícias que fazem parte desta demonstração. As avaliações estarão
        disponíveis em uma etapa futura.
      </p>
      {carregando ? (
        <Carregando />
      ) : (
        <div className="modal-links">
          {dados.slice(0, 5).map((organizacao) => (
            <button key={organizacao.id} onClick={() => aoAbrirOrganizacao(organizacao)}>
              {organizacao.nome}
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

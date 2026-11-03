import { listarOportunidades } from '../../api/oportunidades';
import useCarregar from '../../hooks/useCarregar';
import Carregando from '../ui/Carregando';

/** Resumo de uma organização e das oportunidades abertas dela. */
export default function ConteudoOrganizacao({ organizacao, aoBuscar }) {
  const { dados, carregando } = useCarregar(
    () => listarOportunidades({ organizacaoId: organizacao.id, tamanho: 50 }),
    [organizacao.id],
  );
  return (
    <>
      <p>Organização fictícia da demonstração do Voluntare.</p>
      {carregando ? (
        <Carregando />
      ) : (
        dados.itens.map((oportunidade) => <p key={oportunidade.id}>{oportunidade.descricao}</p>)
      )}
      <button className="primary-button full-width" onClick={() => aoBuscar(organizacao.nome)}>
        Ver oportunidades da organização
      </button>
    </>
  );
}

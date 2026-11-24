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
      {carregando ? (
        <Carregando />
      ) : (
        <>
          <p>
            {dados.total === 1
              ? '1 vaga aberta nesta organização:'
              : `${dados.total} vagas abertas nesta organização:`}
          </p>
          <ul className="modal-lista">
            {dados.itens.map((oportunidade) => (
              <li key={oportunidade.id}>{oportunidade.titulo}</li>
            ))}
          </ul>
        </>
      )}
      <button className="primary-button full-width" onClick={() => aoBuscar(organizacao.nome)}>
        Ver oportunidades da organização
      </button>
    </>
  );
}

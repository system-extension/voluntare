import { ArrowRight, Bookmark } from 'lucide-react';
import { formatarPeriodo, textoPublicacao, textoVagas } from '../../utils/datas';

export default function CartaoOportunidade({
  oportunidade,
  selecionada,
  salva,
  aoSelecionar,
  aoSalvar,
}) {
  const { titulo, organizacao, cidade, uf, inicio, fim, vagasDisponiveis, descricao, criadoEm } =
    oportunidade;
  return (
    <article className={`job-card ${selecionada ? 'selected' : ''}`}>
      <button
        className="job-select"
        aria-pressed={selecionada}
        onClick={aoSelecionar}
        aria-label={`Ver detalhes: ${titulo}`}
      >
        <span className="job-title">{titulo}</span>
        <span className="organization">{organizacao.nome}</span>
        <span className="job-location">
          {cidade}, {uf}
        </span>
        <span className="tags">
          <span>{formatarPeriodo(inicio, fim)}</span>
          <span>{textoVagas(vagasDisponiveis)}</span>
        </span>
        <span className="easy-apply">
          <ArrowRight size={15} /> Candidate-se pelo Voluntare
        </span>
        <span className="job-summary">{descricao}</span>
        <span className="published">{textoPublicacao(criadoEm)}</span>
      </button>
      <button
        className={`icon-button save-card ${salva ? 'saved' : ''}`}
        aria-label={salva ? `Remover dos salvos: ${titulo}` : `Salvar: ${titulo}`}
        aria-pressed={salva}
        onClick={aoSalvar}
      >
        <Bookmark size={21} fill={salva ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}

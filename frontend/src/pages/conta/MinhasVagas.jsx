import { useState } from 'react';
import { ArrowRight, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buscarVarias } from '../../api/oportunidades';
import Carregando from '../../components/ui/Carregando';
import useCarregar from '../../hooks/useCarregar';
import useTitulo from '../../hooks/useTitulo';
import useVagasSalvas from '../../hooks/useVagasSalvas';
import { formatarPeriodo } from '../../utils/datas';
import { caminhoBusca } from '../../utils/rotas';

const ABAS = ['Salvas', 'Candidaturas feitas', 'Participações', 'Arquivo'];
const TITULO_VAZIO = {
  Salvas: 'Nenhuma vaga salva',
  'Candidaturas feitas': 'Nenhuma candidatura',
  Participações: 'Nenhuma participação confirmada',
  Arquivo: 'Nenhuma vaga arquivada',
};

export default function MinhasVagas() {
  useTitulo('Minhas vagas');
  const [aba, setAba] = useState('Salvas');
  const navegar = useNavigate();
  const { salvas, alternar } = useVagasSalvas();
  const { dados, carregando } = useCarregar(() => buscarVarias(salvas), [salvas]);
  const vagasSalvas = (dados ?? []).filter((o) => salvas.includes(o.id));

  const abrirVaga = (oportunidade) =>
    navegar(caminhoBusca({ texto: oportunidade.titulo }), {
      state: { selecionada: oportunidade.id },
    });

  return (
    <section className="myjobs-page">
      <h1>Minhas vagas</h1>
      <div className="page-tabs myjobs-tabs" aria-label="Etapas das vagas">
        {ABAS.map((item) => (
          <button
            key={item}
            className={aba === item ? 'active' : ''}
            aria-pressed={aba === item}
            onClick={() => setAba(item)}
          >
            {item !== 'Arquivo' && <span>{item === 'Salvas' ? salvas.length : 0}</span>}
            {item}
          </button>
        ))}
      </div>
      {aba === 'Salvas' && carregando && !dados ? (
        <Carregando />
      ) : aba === 'Salvas' && vagasSalvas.length > 0 ? (
        <div className="saved-jobs">
          {vagasSalvas.map((oportunidade) => (
            <article className="saved-job" key={oportunidade.id}>
              <div>
                <h2>
                  <button onClick={() => abrirVaga(oportunidade)}>{oportunidade.titulo}</button>
                </h2>
                <p>{oportunidade.organizacao.nome}</p>
                <p>
                  {oportunidade.cidade}, {oportunidade.uf}
                </p>
                <span className="detail-tag">
                  {formatarPeriodo(oportunidade.inicio, oportunidade.fim)}
                </span>
              </div>
              <button
                className="icon-button saved"
                aria-label={`Remover dos salvos: ${oportunidade.titulo}`}
                onClick={() => alternar(oportunidade.id)}
              >
                <Bookmark fill="currentColor" size={21} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="myjobs-empty">
          <div className="empty-icon">
            <Bookmark size={58} strokeWidth={1.5} />
          </div>
          <h2>{TITULO_VAZIO[aba]}</h2>
          <p>
            {aba === 'Salvas'
              ? 'Salve as oportunidades que você quer conhecer melhor.'
              : 'Acompanhe aqui os próximos passos da sua jornada.'}
          </p>
          {aba !== 'Salvas' && (
            <p className="small-note">
              O envio de candidaturas e a confirmação de participações dependem da integração com o
              servidor.
            </p>
          )}
          <button className="primary-button" onClick={() => navegar('/oportunidades')}>
            Achar vagas <ArrowRight size={21} />
          </button>
        </div>
      )}
    </section>
  );
}

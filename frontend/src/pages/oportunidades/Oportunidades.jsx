import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { listarMinhasCandidaturas } from '../../api/candidaturas';
import { listarOportunidades } from '../../api/oportunidades';
import BarraBusca from '../../components/busca/BarraBusca';
import CartaoOportunidade from '../../components/oportunidades/CartaoOportunidade';
import DetalheOportunidade from '../../components/oportunidades/DetalheOportunidade';
import FiltroCausa from '../../components/oportunidades/FiltroCausa';
import Paginacao from '../../components/oportunidades/Paginacao';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useConta from '../../hooks/useConta';
import useModal from '../../hooks/useModal';
import useTitulo from '../../hooks/useTitulo';
import useVagasSalvas from '../../hooks/useVagasSalvas';
import { caminhoBusca } from '../../utils/rotas';
import './oportunidades.css';

const TAMANHO_PAGINA = 15;

/** Busca de oportunidades: filtros na URL, lista à esquerda e detalhe à direita. */
export default function Oportunidades() {
  useTitulo('Vagas de voluntariado');
  const [params] = useSearchParams();
  const filtros = {
    texto: params.get('q') ?? '',
    local: params.get('l') ?? '',
    causa: params.get('causa') ?? '',
    pagina: Number(params.get('pagina')) || 1,
  };

  const navegar = useNavigate();
  const { state } = useLocation();
  const { abrir } = useModal();
  const { estaSalva, alternar } = useVagasSalvas();
  const { usuario } = useConta();
  const voluntario = usuario?.papel === 'VOLUNTARIO';

  // Para o detalhe mostrar "você já se candidatou" em vez do botão
  const minhas = useCarregar(
    () => (voluntario ? listarMinhasCandidaturas() : Promise.resolve([])),
    [usuario?.id],
  );
  const candidaturaPorVaga = Object.fromEntries(
    (minhas.dados ?? []).map((c) => [c.oportunidade.id, c]),
  );

  // Vinda de "Minhas vagas" ou da área da organização: já abre a vaga escolhida.
  const [selecionadaId, setSelecionadaId] = useState(state?.selecionada ?? null);
  const [detalheNoCelular, setDetalheNoCelular] = useState(Boolean(state?.selecionada));

  const { dados, erro, recarregar } = useCarregar(
    () => listarOportunidades({ ...filtros, tamanho: TAMANHO_PAGINA }),
    [filtros.texto, filtros.local, filtros.causa, filtros.pagina],
  );

  useEffect(() => {
    if (detalheNoCelular && window.matchMedia('(max-width: 640px)').matches) {
      document.querySelector('.job-detail')?.scrollIntoView({ block: 'start' });
      document.querySelector('.back-to-results')?.focus({ preventScroll: true });
    }
  }, [detalheNoCelular, selecionadaId]);

  const irPara = (mudancas, rolagem = { top: 0 }) => {
    setSelecionadaId(null);
    setDetalheNoCelular(false);
    navegar(caminhoBusca({ ...filtros, pagina: 1, ...mudancas }));
    window.scrollTo(rolagem);
  };

  const itens = dados?.itens ?? [];
  const selecionada = itens.find((o) => o.id === selecionadaId) ?? itens[0];

  return (
    <>
      <BarraBusca
        key={`${filtros.texto}|${filtros.local}`}
        textoInicial={filtros.texto}
        localInicial={filtros.local}
      />
      <section className="results-container" aria-label="Oportunidades de voluntariado">
        <FiltroCausa causa={filtros.causa} aoMudar={(causa) => irPara({ causa }, undefined)} />
        <div className="results-heading">
          <h1>
            {filtros.texto ? `Vagas de ${filtros.texto}` : 'Vagas de voluntariado'}
            {filtros.local && ` em ${filtros.local}`}
          </h1>
          <p>Vagas abertas que ainda não começaram</p>
        </div>

        {erro ? (
          <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />
        ) : !dados ? (
          <Carregando />
        ) : (
          <div className="results-layout">
            <div className={`job-list ${detalheNoCelular ? 'mobile-hidden' : ''}`}>
              <div className="results-count">
                <span>{dados.total} vagas encontradas</span>
                <span>
                  Página {dados.pagina} de {dados.totalPaginas}
                </span>
              </div>
              {itens.map((oportunidade) => (
                <CartaoOportunidade
                  key={oportunidade.id}
                  oportunidade={oportunidade}
                  selecionada={selecionada?.id === oportunidade.id}
                  salva={estaSalva(oportunidade.id)}
                  aoSelecionar={() => {
                    setSelecionadaId(oportunidade.id);
                    setDetalheNoCelular(true);
                  }}
                  aoSalvar={() => alternar(oportunidade.id)}
                />
              ))}
              {!itens.length && (
                <div className="empty-state">
                  <Search size={36} />
                  <h2>Nenhuma vaga encontrada</h2>
                  <p>Tente outra atividade, cidade ou causa.</p>
                  <button
                    className="primary-button"
                    onClick={() => irPara({ texto: '', local: '', causa: '' })}
                  >
                    Ver todas as vagas
                  </button>
                </div>
              )}
              {itens.length > 0 && (
                <Paginacao
                  pagina={dados.pagina}
                  totalPaginas={dados.totalPaginas}
                  aoMudar={(pagina) => irPara({ pagina }, { top: 0, behavior: 'smooth' })}
                />
              )}
            </div>
            {selecionada && (
              <DetalheOportunidade
                oportunidade={selecionada}
                visivelNoCelular={detalheNoCelular}
                salva={estaSalva(selecionada.id)}
                minhaCandidatura={candidaturaPorVaga[selecionada.id]}
                aoVoltar={() => setDetalheNoCelular(false)}
                aoCandidatar={() =>
                  abrir('candidatura', { oportunidade: selecionada, aoConcluir: minhas.recarregar })
                }
                aoSalvar={() => alternar(selecionada.id)}
                aoAbrirOrganizacao={() =>
                  abrir('organizacao', { organizacao: selecionada.organizacao })
                }
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}

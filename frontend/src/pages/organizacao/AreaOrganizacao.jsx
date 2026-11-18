import { useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FilePen,
  HeartHandshake,
  Inbox,
  MapPin,
  Pencil,
  Plus,
  Search,
  UserRound,
  Users,
  UsersRound,
  XCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  cancelarOportunidade,
  encerrarOportunidade,
  listarDaMinhaOrganizacao,
  publicarOportunidade,
} from '../../api/oportunidades';
import { buscarMinhaOrganizacao, buscarPainel } from '../../api/organizacoes';
import { STATUS_OPORTUNIDADE, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useConta from '../../hooks/useConta';
import useModal from '../../hooks/useModal';
import useTitulo from '../../hooks/useTitulo';
import { formatarPeriodo } from '../../utils/datas';
import { caminhoBusca } from '../../utils/rotas';
import { normalizar } from '../../utils/texto';
import './organizacao.css';

const classeStatus = (status) => STATUS_OPORTUNIDADE.find((s) => s.valor === status)?.classe;
const preenchida = (o) => o.status === 'ABERTA' && o.vagasDisponiveis === 0;

// filtros dos cartões do painel; "abertas" e "preenchidas" não se repetem (D-26)
const FILTROS = {
  TODAS: () => true,
  RASCUNHO: (o) => o.status === 'RASCUNHO',
  ABERTA: (o) => o.status === 'ABERTA' && !preenchida(o),
  PREENCHIDA: preenchida,
  ENCERRADA: (o) => o.status === 'ENCERRADA',
  CANCELADA: (o) => o.status === 'CANCELADA',
};

/** Área da organização: painel com os números, lista das vagas e ações sobre cada uma. */
export default function AreaOrganizacao() {
  useTitulo('Área da organização');
  const navegar = useNavigate();
  const { state } = useLocation();
  const { abrir } = useModal();
  const { usuario } = useConta();
  const gestor = usuario?.papel === 'GESTOR';
  const tituloRef = useRef(null);

  const [filtro, setFiltro] = useState('TODAS');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(state?.aviso ?? '');
  const [erroAcao, setErroAcao] = useState('');

  const organizacao = useCarregar(buscarMinhaOrganizacao);
  const painel = useCarregar(buscarPainel);
  const { dados: oportunidades, erro, recarregar } = useCarregar(listarDaMinhaOrganizacao);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (!oportunidades) return <Carregando />;

  const filtradas = oportunidades.filter(
    (o) => FILTROS[filtro](o) && normalizar(o.titulo).includes(normalizar(busca)),
  );

  const depoisDaAcao = (mensagem) => {
    setErroAcao('');
    setAviso(mensagem);
    recarregar();
    painel.recarregar();
    tituloRef.current?.focus();
  };

  async function executar(acao, mensagem) {
    try {
      await acao();
      depoisDaAcao(mensagem);
    } catch (e) {
      setErroAcao(e.message);
    }
  }

  function confirmar(oportunidade, tipo) {
    const rascunho = oportunidade.status === 'RASCUNHO';
    const textos = {
      encerrar: {
        titulo: 'Encerrar vaga',
        mensagem: `“${oportunidade.titulo}” sai da busca e não recebe novas candidaturas. Depois do fim da atividade, registre a presença dos confirmados. Não é possível reabrir uma vaga encerrada.`,
        ok: 'Vaga encerrada e retirada da busca.',
      },
      cancelar: rascunho
        ? {
            titulo: 'Descartar rascunho',
            mensagem: `O rascunho “${oportunidade.titulo}” será descartado.`,
            ok: 'Rascunho descartado.',
          }
        : {
            titulo: 'Cancelar vaga',
            mensagem: `“${oportunidade.titulo}” sai da busca. Candidaturas e participações continuam no histórico. Não é possível desfazer o cancelamento.`,
            ok: 'Vaga cancelada e retirada da busca.',
          },
    }[tipo];
    abrir('confirmar', {
      titulo: textos.titulo,
      mensagem: textos.mensagem,
      textoConfirmar: textos.titulo,
      pedirMotivo: tipo === 'cancelar' && !rascunho ? 'Motivo (opcional, fica no histórico)' : null,
      aoConfirmar: (motivo) =>
        executar(
          () =>
            tipo === 'encerrar'
              ? encerrarOportunidade(oportunidade.id)
              : cancelarOportunidade(oportunidade.id, motivo),
          textos.ok,
        ),
    });
  }

  const p = painel.dados;
  const cartoes = [
    { filtro: 'RASCUNHO', rotulo: 'Rascunhos', Icone: FilePen, valor: p?.vagas.rascunhos },
    { filtro: 'ABERTA', rotulo: 'Vagas abertas', Icone: HeartHandshake, valor: p?.vagas.abertas },
    {
      filtro: 'PREENCHIDA',
      rotulo: 'Vagas preenchidas',
      Icone: Users,
      valor: p?.vagas.preenchidas,
    },
    { filtro: 'ENCERRADA', rotulo: 'Encerradas', Icone: CheckCircle2, valor: p?.vagas.encerradas },
  ];

  return (
    <section className="ong-page">
      <div className="ong-heading">
        <div>
          <div className="ong-eyebrow">
            <Building2 size={16} /> Área da organização
            {organizacao.dados && ` · ${organizacao.dados.nome}`}
          </div>
          <h1 ref={tituloRef} tabIndex={-1}>
            Suas oportunidades,
            <br className="ong-title-break" /> novos voluntários.
          </h1>
          <p>
            {gestor
              ? 'Crie e acompanhe as vagas da sua organização.'
              : 'Acompanhe as vagas pelas quais você é responsável.'}
          </p>
        </div>
        <div className="ong-heading-actions">
          {gestor && (
            <button className="ong-outline-button" onClick={() => navegar('/organizacao/equipe')}>
              <UsersRound size={18} /> Equipe
            </button>
          )}
          {gestor && (
            <button className="primary-button" onClick={() => navegar('/organizacao/nova')}>
              <Plus size={20} /> Anunciar uma vaga
            </button>
          )}
        </div>
      </div>
      {erroAcao && (
        <p className="ong-error-banner" role="alert">
          {erroAcao}
        </p>
      )}
      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} />
          {aviso}
        </p>
      )}

      <div className="ong-stats">
        {cartoes.map(({ filtro: valor, rotulo: texto, Icone, valor: numero }) => (
          <button
            key={valor}
            onClick={() => setFiltro(filtro === valor ? 'TODAS' : valor)}
            aria-pressed={filtro === valor}
            className={filtro === valor ? 'selected' : ''}
          >
            <span>
              <Icone size={20} />
              {texto}
            </span>
            <strong>{numero ?? '–'}</strong>
          </button>
        ))}
      </div>
      {p && (
        <div className="ong-indicadores" aria-label="Indicadores">
          <span>
            <Inbox size={17} /> <strong>{p.candidaturasPendentes}</strong> candidaturas esperando
            resposta
          </span>
          <span>
            <Users size={17} /> <strong>{p.participacoes.confirmadas}</strong> voluntários
            confirmados
          </span>
          <span>
            <Clock3 size={17} />{' '}
            <strong>
              {Number(p.horasRealizadas).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h
            </strong>{' '}
            de voluntariado em {p.participacoes.presentes} presenças
          </span>
          {p.escopo === 'MINHAS_VAGAS' && <em>Números das vagas pelas quais você responde</em>}
        </div>
      )}

      <div className="ong-list-header">
        <h2>Vagas</h2>
        <label className="ong-search">
          <Search size={18} />
          <span className="sr-only">Buscar vagas</span>
          <input
            placeholder="Buscar por título"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
      </div>
      <div className="ong-tabs" aria-label="Status das vagas">
        {[{ valor: 'TODAS', plural: 'Todas' }, ...STATUS_OPORTUNIDADE].map(({ valor, plural }) => (
          <button
            key={valor}
            aria-pressed={filtro === valor}
            className={filtro === valor ? 'active' : ''}
            onClick={() => setFiltro(valor)}
          >
            {plural}
          </button>
        ))}
      </div>

      {!filtradas.length ? (
        <div className="ong-empty">
          <div className="ong-empty-icon">
            <HeartHandshake size={40} strokeWidth={1.5} />
          </div>
          <h3>
            {oportunidades.length
              ? 'Nenhuma vaga neste filtro'
              : 'Sua próxima ação começa com um convite'}
          </h3>
          <p>
            {oportunidades.length
              ? 'Busque por outro título ou escolha um status diferente.'
              : gestor
                ? 'Conte o que sua organização faz e encontre pessoas que querem contribuir com a sua causa.'
                : 'Quando o gestor deixar uma vaga com você, ela aparece aqui.'}
          </p>
          {oportunidades.length ? (
            <button
              className="text-button"
              onClick={() => {
                setFiltro('TODAS');
                setBusca('');
              }}
            >
              Mostrar todas as vagas
            </button>
          ) : (
            gestor && (
              <button className="primary-button" onClick={() => navegar('/organizacao/nova')}>
                Criar minha primeira vaga <ArrowRight size={18} />
              </button>
            )
          )}
        </div>
      ) : (
        <div className="ong-job-list">
          {filtradas.map((o) => (
            <article className="ong-job-row" key={o.id}>
              <div className="ong-job-summary">
                <span className={`ong-status ${classeStatus(o.status)}`}>
                  {preenchida(o) ? 'Preenchida' : rotulo(STATUS_OPORTUNIDADE, o.status)}
                </span>
                <h3>{o.titulo}</h3>
                <p className="inline-icon">
                  <UserRound size={15} /> Responsável: {o.responsavel?.nome}
                </p>
                <div className="ong-job-meta">
                  {o.cidade && (
                    <span>
                      <MapPin size={15} />
                      {o.cidade}, {o.uf}
                    </span>
                  )}
                  {o.inicio && o.fim && (
                    <span>
                      <CalendarDays size={15} />
                      {formatarPeriodo(o.inicio, o.fim)}
                    </span>
                  )}
                  {o.vagas != null && (
                    <span>
                      <Users size={15} />
                      {o.vagas - o.vagasDisponiveis} de {o.vagas} vaga(s) ocupada(s)
                    </span>
                  )}
                </div>
              </div>
              <div className="ong-job-actions">
                {(o.status === 'RASCUNHO' || o.status === 'ABERTA') && (
                  <button
                    className="ong-outline-button"
                    onClick={() => navegar(`/organizacao/${o.id}/editar`)}
                  >
                    <Pencil size={16} />
                    {o.status === 'RASCUNHO' ? 'Continuar rascunho' : 'Editar'}
                  </button>
                )}
                {o.status === 'RASCUNHO' && (
                  <button
                    className="text-button"
                    onClick={() =>
                      executar(() => publicarOportunidade(o.id), 'Vaga publicada na busca.')
                    }
                  >
                    Publicar
                  </button>
                )}
                {o.status !== 'RASCUNHO' && (
                  <button
                    className="text-button"
                    onClick={() => navegar(`/organizacao/${o.id}/candidatos`)}
                  >
                    {o.status === 'ENCERRADA' ? 'Candidatos e presença' : 'Candidatos'}
                  </button>
                )}
                {o.status === 'ABERTA' && (
                  <>
                    <button
                      className="text-button"
                      onClick={() =>
                        navegar(caminhoBusca({ texto: o.titulo }), {
                          state: { selecionada: o.id },
                        })
                      }
                    >
                      Ver na busca
                    </button>
                    <button className="text-button" onClick={() => confirmar(o, 'encerrar')}>
                      Encerrar
                    </button>
                  </>
                )}
                {(o.status === 'RASCUNHO' || o.status === 'ABERTA') && (
                  <button className="text-button" onClick={() => confirmar(o, 'cancelar')}>
                    <XCircle size={16} /> {o.status === 'RASCUNHO' ? 'Descartar' : 'Cancelar'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

import { useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  HeartHandshake,
  MapPin,
  Pencil,
  Plus,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  cancelarOportunidade,
  encerrarOportunidade,
  listarDaMinhaOrganizacao,
} from '../../api/oportunidades';
import { buscarMinhaOrganizacao } from '../../api/organizacoes';
import { STATUS_OPORTUNIDADE, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useModal from '../../hooks/useModal';
import useTitulo from '../../hooks/useTitulo';
import { formatarPeriodo } from '../../utils/datas';
import { caminhoBusca } from '../../utils/rotas';
import { normalizar } from '../../utils/texto';
import './organizacao.css';

const ICONES = { ABERTA: HeartHandshake, ENCERRADA: CheckCircle2, CANCELADA: XCircle };
const classeStatus = (status) => STATUS_OPORTUNIDADE.find((s) => s.valor === status)?.classe;

/** Área da organização: oportunidades publicadas e ações sobre elas. */
export default function AreaOrganizacao() {
  useTitulo('ONGs / Anunciar vagas');
  const navegar = useNavigate();
  const { state } = useLocation();
  const { abrir } = useModal();
  const tituloRef = useRef(null);

  const [filtro, setFiltro] = useState('TODAS');
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState(state?.aviso ?? '');
  const [erroAcao, setErroAcao] = useState('');

  const organizacao = useCarregar(buscarMinhaOrganizacao);
  const { dados: oportunidades, erro, recarregar } = useCarregar(listarDaMinhaOrganizacao);

  if (erro) return <ErroCarregamento erro={erro} aoTentarNovamente={recarregar} />;
  if (!oportunidades) return <Carregando />;

  const filtradas = oportunidades.filter(
    (o) =>
      (filtro === 'TODAS' || o.status === filtro) &&
      normalizar(o.titulo).includes(normalizar(busca)),
  );

  function confirmar(oportunidade, acao) {
    const encerrar = acao === 'encerrar';
    abrir('confirmar', {
      titulo: encerrar ? 'Encerrar vaga' : 'Cancelar vaga',
      mensagem: encerrar
        ? `“${oportunidade.titulo}” sai da busca e não recebe novas candidaturas. Não é possível reabrir uma vaga encerrada.`
        : `“${oportunidade.titulo}” sai da busca e os voluntários confirmados continuam no histórico. Não é possível desfazer o cancelamento.`,
      textoConfirmar: encerrar ? 'Encerrar vaga' : 'Cancelar vaga',
      aoConfirmar: async () => {
        try {
          await (encerrar ? encerrarOportunidade : cancelarOportunidade)(oportunidade.id);
          setErroAcao('');
          setAviso(
            encerrar
              ? 'Vaga encerrada e retirada da busca.'
              : 'Vaga cancelada e retirada da busca.',
          );
          tituloRef.current?.focus();
        } catch (e) {
          setErroAcao(e.message);
        }
      },
    });
  }

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
          <p>Crie e acompanhe as vagas da sua ONG ou projeto social.</p>
        </div>
        <button className="primary-button" onClick={() => navegar('/organizacao/nova')}>
          <Plus size={20} /> Anunciar uma vaga
        </button>
      </div>
      <div className="ong-local-note">
        <FileText size={18} />
        <span>
          Os anúncios ficam salvos apenas neste navegador. A divulgação pública estará disponível
          com a integração ao servidor.
        </span>
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
        {STATUS_OPORTUNIDADE.map(({ valor, plural }) => {
          const Icone = ICONES[valor];
          return (
            <button
              key={valor}
              onClick={() => setFiltro(filtro === valor ? 'TODAS' : valor)}
              aria-pressed={filtro === valor}
              className={filtro === valor ? 'selected' : ''}
            >
              <span>
                <Icone size={20} />
                {`Vagas ${plural.toLowerCase()}`}
              </span>
              <strong>{oportunidades.filter((o) => o.status === valor).length}</strong>
            </button>
          );
        })}
      </div>

      <div className="ong-list-header">
        <h2>Minhas vagas</h2>
        <label className="ong-search">
          <Search size={18} />
          <span className="sr-only">Buscar minhas vagas</span>
          <input
            placeholder="Buscar por título"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
      </div>
      <div className="ong-tabs" aria-label="Status dos anúncios">
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
              : 'Conte o que sua organização faz e encontre pessoas que querem contribuir com a sua causa.'}
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
            <button className="primary-button" onClick={() => navegar('/organizacao/nova')}>
              Criar minha primeira vaga <ArrowRight size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className="ong-job-list">
          {filtradas.map((oportunidade) => (
            <article className="ong-job-row" key={oportunidade.id}>
              <div className="ong-job-summary">
                <span className={`ong-status ${classeStatus(oportunidade.status)}`}>
                  {rotulo(STATUS_OPORTUNIDADE, oportunidade.status)}
                </span>
                <h3>{oportunidade.titulo}</h3>
                <p>{oportunidade.organizacao.nome}</p>
                <div className="ong-job-meta">
                  <span>
                    <MapPin size={15} />
                    {oportunidade.cidade}, {oportunidade.uf}
                  </span>
                  <span>
                    <CalendarDays size={15} />
                    {formatarPeriodo(oportunidade.inicio, oportunidade.fim)}
                  </span>
                  <span>
                    <Users size={15} />
                    {oportunidade.vagas} vaga(s)
                  </span>
                </div>
              </div>
              {oportunidade.status === 'ABERTA' && (
                <div className="ong-job-actions">
                  <button
                    className="ong-outline-button"
                    onClick={() => navegar(`/organizacao/${oportunidade.id}/editar`)}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      navegar(caminhoBusca({ texto: oportunidade.titulo }), {
                        state: { selecionada: oportunidade.id },
                      })
                    }
                  >
                    Ver na busca
                  </button>
                  <button
                    className="text-button"
                    onClick={() => confirmar(oportunidade, 'encerrar')}
                  >
                    Encerrar vaga
                  </button>
                  <button
                    className="text-button"
                    onClick={() => confirmar(oportunidade, 'cancelar')}
                  >
                    Cancelar vaga
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

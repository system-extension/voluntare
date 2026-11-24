import { useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, ClipboardList, History } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { desistir, listarMinhasCandidaturas } from '../../api/candidaturas';
import { buscarVarias } from '../../api/oportunidades';
import { listarMinhasParticipacoes } from '../../api/participacoes';
import { STATUS_CANDIDATURA, STATUS_PARTICIPACAO, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useModal from '../../hooks/useModal';
import useTitulo from '../../hooks/useTitulo';
import useVagasSalvas from '../../hooks/useVagasSalvas';
import { formatarPeriodo } from '../../utils/datas';
import { caminhoBusca } from '../../utils/rotas';

const ABAS = ['Salvas', 'Candidaturas', 'Histórico'];
const PRAZO_DEVOLUCAO_MS = 48 * 60 * 60 * 1000;

const classe = (lista, valor) => lista.find((i) => i.valor === valor)?.classe ?? '';
const horas = (valor) => Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export default function MinhasVagas() {
  useTitulo('Minhas vagas');
  const { state } = useLocation();
  const [aba, setAba] = useState(ABAS.includes(state?.aba) ? state.aba : 'Salvas');
  const navegar = useNavigate();
  const { salvas } = useVagasSalvas();
  const candidaturas = useCarregar(listarMinhasCandidaturas);
  const historico = useCarregar(listarMinhasParticipacoes);

  const contagem = {
    Salvas: salvas.length,
    Candidaturas: candidaturas.dados?.length ?? 0,
    Histórico: historico.dados?.participacoes.length ?? 0,
  };

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
            <span>{contagem[item]}</span>
            {item}
          </button>
        ))}
      </div>
      {aba === 'Salvas' && <Salvas navegar={navegar} />}
      {aba === 'Candidaturas' && (
        <Candidaturas
          estado={candidaturas}
          navegar={navegar}
          aoMudar={() => {
            candidaturas.recarregar();
            historico.recarregar();
          }}
        />
      )}
      {aba === 'Histórico' && <Historico estado={historico} navegar={navegar} />}
    </section>
  );
}

function abrirVaga(navegar, id, titulo) {
  navegar(caminhoBusca({ texto: titulo }), { state: { selecionada: id } });
}

function Vazio({ icone: Icone, titulo, texto, navegar }) {
  return (
    <div className="myjobs-empty">
      <div className="empty-icon">
        <Icone size={58} strokeWidth={1.5} />
      </div>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <button className="primary-button" onClick={() => navegar('/oportunidades')}>
        Achar vagas <ArrowRight size={21} />
      </button>
    </div>
  );
}

function Salvas({ navegar }) {
  const { salvas, alternar } = useVagasSalvas();
  const { dados, carregando } = useCarregar(() => buscarVarias(salvas), [salvas]);
  const vagas = (dados ?? []).filter((o) => salvas.includes(o.id));

  if (carregando && !dados) return <Carregando />;
  if (!vagas.length)
    return (
      <Vazio
        icone={Bookmark}
        titulo="Nenhuma vaga salva"
        texto="Salve as oportunidades que você quer conhecer melhor."
        navegar={navegar}
      />
    );
  return (
    <div className="saved-jobs">
      {vagas.map((o) => (
        <article className="saved-job" key={o.id}>
          <div>
            <h2>
              <button onClick={() => abrirVaga(navegar, o.id, o.titulo)}>{o.titulo}</button>
            </h2>
            <p>{o.organizacao.nome}</p>
            <p>
              {o.cidade}, {o.uf}
            </p>
            <span className="detail-tag">{formatarPeriodo(o.inicio, o.fim)}</span>
          </div>
          <button
            className="icon-button saved"
            aria-label={`Remover dos salvos: ${o.titulo}`}
            onClick={() => alternar(o.id)}
          >
            <Bookmark fill="currentColor" size={21} />
          </button>
        </article>
      ))}
    </div>
  );
}

/** Pode desistir: pendente, ou aceita com a participação confirmada e a atividade ainda por vir. */
function podeDesistir(c, agora) {
  if (c.status === 'PENDENTE') return true;
  return (
    c.status === 'ACEITA' &&
    c.participacao?.status === 'CONFIRMADA' &&
    new Date(c.oportunidade.inicio) > agora
  );
}

function Candidaturas({ estado, navegar, aoMudar }) {
  const { abrir } = useModal();
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');

  if (estado.erro)
    return <ErroCarregamento erro={estado.erro} aoTentarNovamente={estado.recarregar} />;
  if (!estado.dados) return <Carregando />;
  if (!estado.dados.length)
    return (
      <Vazio
        icone={ClipboardList}
        titulo="Nenhuma candidatura"
        texto="Quando você se candidatar a uma vaga, ela aparece aqui com a resposta da organização."
        navegar={navegar}
      />
    );

  const agora = new Date();

  function confirmarDesistencia(c) {
    const pendente = c.status === 'PENDENTE';
    const emCimaDaHora = new Date(c.oportunidade.inicio) - agora < PRAZO_DEVOLUCAO_MS;
    abrir('confirmar', {
      titulo: pendente ? 'Retirar candidatura' : 'Desistir da participação',
      mensagem: pendente
        ? `Sua candidatura para “${c.oportunidade.titulo}” será retirada. Não é possível se candidatar de novo a esta vaga.`
        : emCimaDaHora
          ? `Faltam menos de 48 horas para “${c.oportunidade.titulo}”. Você pode desistir, mas a vaga não volta para outra pessoa e a desistência fica registrada como fora do prazo.`
          : `Você deixa de participar de “${c.oportunidade.titulo}” e a vaga volta para outra pessoa.`,
      textoConfirmar: pendente ? 'Retirar candidatura' : 'Desistir',
      aoConfirmar: async () => {
        try {
          await desistir(c.id);
          setErro('');
          setAviso(pendente ? 'Candidatura retirada.' : 'Desistência registrada.');
          aoMudar();
        } catch (e) {
          setErro(e.message);
        }
      },
    });
  }

  return (
    <div className="saved-jobs">
      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} /> {aviso}
        </p>
      )}
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      {estado.dados.map((c) => (
        <article className="saved-job" key={c.id}>
          <div>
            <h2>
              {c.oportunidade.status === 'ABERTA' ? (
                <button
                  onClick={() => abrirVaga(navegar, c.oportunidade.id, c.oportunidade.titulo)}
                >
                  {c.oportunidade.titulo}
                </button>
              ) : (
                c.oportunidade.titulo
              )}
            </h2>
            <p>{c.oportunidade.organizacao}</p>
            <p>
              {c.oportunidade.cidade}, {c.oportunidade.uf}
            </p>
            <span className="detail-tag">
              {formatarPeriodo(c.oportunidade.inicio, c.oportunidade.fim)}
            </span>
          </div>
          <div className="job-actions">
            <span className={`status-chip ${classe(STATUS_CANDIDATURA, c.status)}`}>
              {c.participacao && c.participacao.status !== 'CONFIRMADA'
                ? rotulo(STATUS_PARTICIPACAO, c.participacao.status)
                : rotulo(STATUS_CANDIDATURA, c.status)}
            </span>
            {podeDesistir(c, agora) && (
              <button className="text-button" onClick={() => confirmarDesistencia(c)}>
                {c.status === 'PENDENTE' ? 'Retirar candidatura' : 'Desistir'}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function Historico({ estado, navegar }) {
  if (estado.erro)
    return <ErroCarregamento erro={estado.erro} aoTentarNovamente={estado.recarregar} />;
  if (!estado.dados) return <Carregando />;
  const { totalHoras, presencas, participacoes } = estado.dados;
  if (!participacoes.length)
    return (
      <Vazio
        icone={History}
        titulo="Nenhuma participação ainda"
        texto="Quando uma organização aceitar sua candidatura, a participação aparece aqui."
        navegar={navegar}
      />
    );
  return (
    <>
      <div className="historico-resumo">
        <div>
          <strong>{horas(totalHoras)} h</strong>
          de voluntariado
        </div>
        <div>
          <strong>{presencas}</strong>
          {presencas === 1 ? 'participação com presença' : 'participações com presença'}
        </div>
      </div>
      <div className="saved-jobs">
        {participacoes.map((p) => (
          <article className="saved-job" key={p.id}>
            <div>
              <h2>{p.oportunidade.titulo}</h2>
              <p>{p.oportunidade.organizacao}</p>
              <span className="detail-tag">
                {formatarPeriodo(p.oportunidade.inicio, p.oportunidade.fim)}
              </span>
            </div>
            <div className="job-actions">
              <span className={`status-chip ${classe(STATUS_PARTICIPACAO, p.status)}`}>
                {rotulo(STATUS_PARTICIPACAO, p.status)}
              </span>
              {p.horasRealizadas != null && <strong>{horas(p.horasRealizadas)} h</strong>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

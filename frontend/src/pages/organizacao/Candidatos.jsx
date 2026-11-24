import { useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Mail, MapPin, Phone, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { aceitar, listarCandidatos, rejeitar } from '../../api/candidaturas';
import { buscarParaGestao } from '../../api/oportunidades';
import { registrarAusencia, registrarPresenca } from '../../api/participacoes';
import { STATUS_CANDIDATURA, STATUS_PARTICIPACAO, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useModal from '../../hooks/useModal';
import useTitulo from '../../hooks/useTitulo';
import { formatarPeriodo } from '../../utils/datas';
import './organizacao.css';

const classe = (lista, valor) => lista.find((i) => i.valor === valor)?.classe ?? '';

/** Duração da atividade em horas: limite das horas registradas (RN-47). */
const duracaoEmHoras = (o) =>
  Math.round(((new Date(o.fim) - new Date(o.inicio)) / 36e5) * 100) / 100;

/** Rota /organizacao/:id/candidatos: decidir candidaturas e registrar presença. */
export default function Candidatos() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { abrir } = useModal();
  const vaga = useCarregar(() => buscarParaGestao(id), [id]);
  const candidatos = useCarregar(() => listarCandidatos(id), [id]);
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  useTitulo('Candidatos');

  if (vaga.erro || candidatos.erro) return <ErroCarregamento erro={vaga.erro ?? candidatos.erro} />;
  if (!vaga.dados || !candidatos.dados) return <Carregando />;

  const o = vaga.dados;
  const terminou = new Date(o.fim) <= new Date();
  const podeDecidir = o.status === 'ABERTA';
  const podeRegistrar = terminou && o.status !== 'CANCELADA';

  async function executar(acao, mensagem) {
    try {
      await acao();
      setErro('');
      setAviso(mensagem);
      vaga.recarregar();
      candidatos.recarregar();
    } catch (e) {
      setAviso('');
      setErro(e.message);
    }
  }

  const confirmarRejeicao = (c) =>
    abrir('confirmar', {
      titulo: 'Rejeitar candidatura',
      mensagem: `${c.voluntario.nome} não vai participar desta vaga e não poderá se candidatar de novo a ela.`,
      textoConfirmar: 'Rejeitar',
      pedirMotivo: 'Motivo (opcional, fica no histórico)',
      aoConfirmar: (motivo) =>
        executar(() => rejeitar(c.id, motivo), `Candidatura de ${c.voluntario.nome} rejeitada.`),
    });

  const confirmarAusencia = (c) =>
    abrir('confirmar', {
      titulo: 'Registrar ausência',
      mensagem: `A ausência de ${c.voluntario.nome} fica registrada e não pode ser corrigida depois.`,
      textoConfirmar: 'Registrar ausência',
      pedirMotivo: 'Observação (opcional)',
      aoConfirmar: (motivo) =>
        executar(
          () => registrarAusencia(c.participacao.id, motivo),
          `Ausência de ${c.voluntario.nome} registrada.`,
        ),
    });

  const ocupadas = o.vagas - o.vagasDisponiveis;

  return (
    <section className="ong-page">
      <button className="text-button" onClick={() => navegar('/organizacao')}>
        <ArrowLeft size={17} /> Voltar às vagas
      </button>
      <div className="ong-heading">
        <div>
          <div className="ong-eyebrow">Candidatos</div>
          <h1>{o.titulo}</h1>
          <div className="ong-job-meta">
            <span>
              <CalendarDays size={15} /> {formatarPeriodo(o.inicio, o.fim)}
            </span>
            <span>
              <Users size={15} /> {ocupadas} de {o.vagas} vaga(s) ocupada(s)
            </span>
          </div>
        </div>
      </div>
      {!podeDecidir && !podeRegistrar && (
        <p className="ong-local-note">
          {o.status === 'CANCELADA'
            ? 'Vaga cancelada: candidaturas e participações ficam só para consulta.'
            : 'A presença pode ser registrada depois que a atividade terminar.'}
        </p>
      )}
      {podeRegistrar && (
        <p className="ong-local-note">
          A atividade terminou. Registre presença (com as horas) ou ausência de cada confirmado. O
          registro é definitivo.
        </p>
      )}
      {erro && (
        <p className="ong-error-banner" role="alert">
          {erro}
        </p>
      )}
      {aviso && (
        <p className="ong-success" role="status">
          <CheckCircle2 size={19} /> {aviso}
        </p>
      )}

      {!candidatos.dados.length ? (
        <div className="ong-empty">
          <h3>Nenhuma candidatura ainda</h3>
          <p>Quando alguém se candidatar, aparece aqui na ordem de chegada.</p>
        </div>
      ) : (
        <div className="ong-job-list">
          {candidatos.dados.map((c) => (
            <article className="ong-job-row candidato" key={c.id}>
              <div className="ong-job-summary">
                <span className={`ong-status ${classe(STATUS_CANDIDATURA, c.status)}`}>
                  {c.participacao
                    ? rotulo(STATUS_PARTICIPACAO, c.participacao.status)
                    : rotulo(STATUS_CANDIDATURA, c.status).replace('Você desistiu', 'Desistiu')}
                </span>
                <h3>{c.voluntario.nome}</h3>
                <div className="ong-job-meta">
                  <span>
                    <Mail size={15} /> {c.voluntario.email}
                  </span>
                  {c.voluntario.telefone && (
                    <span>
                      <Phone size={15} /> {c.voluntario.telefone}
                    </span>
                  )}
                  {c.voluntario.cidade && (
                    <span>
                      <MapPin size={15} /> {c.voluntario.cidade}
                    </span>
                  )}
                </div>
                {c.voluntario.disponibilidade && (
                  <p className="candidato-texto">Disponibilidade: {c.voluntario.disponibilidade}</p>
                )}
                {c.voluntario.habilidades.length > 0 && (
                  <p className="candidato-texto">
                    Habilidades: {c.voluntario.habilidades.join(', ')}
                  </p>
                )}
                {c.voluntario.interesses.length > 0 && (
                  <p className="candidato-texto">
                    Interesses: {c.voluntario.interesses.join(', ')}
                  </p>
                )}
                {c.participacao?.horasRealizadas != null && (
                  <p className="candidato-texto">
                    <strong>
                      {Number(c.participacao.horasRealizadas).toLocaleString('pt-BR')} h
                    </strong>{' '}
                    registradas
                  </p>
                )}
              </div>
              <div className="ong-job-actions">
                {podeDecidir && c.status === 'PENDENTE' && (
                  <>
                    <button
                      className="primary-button"
                      disabled={o.vagasDisponiveis <= 0}
                      title={
                        o.vagasDisponiveis <= 0 ? 'Todas as vagas já estão ocupadas' : undefined
                      }
                      onClick={() =>
                        executar(() => aceitar(c.id), `${c.voluntario.nome} confirmado na vaga.`)
                      }
                    >
                      Aceitar
                    </button>
                    <button className="text-button" onClick={() => confirmarRejeicao(c)}>
                      Rejeitar
                    </button>
                  </>
                )}
                {podeRegistrar && c.participacao?.status === 'CONFIRMADA' && (
                  <Presenca
                    candidato={c}
                    maximo={duracaoEmHoras(o)}
                    aoRegistrar={(h) =>
                      executar(
                        () => registrarPresenca(c.participacao.id, h),
                        `Presença de ${c.voluntario.nome} registrada.`,
                      )
                    }
                    aoAusencia={() => confirmarAusencia(c)}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/** Horas já vêm com a duração da atividade, que é o máximo permitido. */
function Presenca({ candidato, maximo, aoRegistrar, aoAusencia }) {
  const [horas, setHoras] = useState(String(maximo));
  const [erro, setErro] = useState('');
  const { abrir } = useModal();

  function registrar() {
    const valor = Number(horas.replace(',', '.'));
    if (!(valor > 0)) return setErro('As horas precisam ser maiores que zero.');
    if (valor > maximo) return setErro(`No máximo ${maximo} h, a duração da atividade.`);
    setErro('');
    abrir('confirmar', {
      titulo: 'Registrar presença',
      mensagem: `${candidato.voluntario.nome}: presença com ${valor.toLocaleString('pt-BR')} h. O registro é definitivo.`,
      textoConfirmar: 'Registrar presença',
      aoConfirmar: () => aoRegistrar(valor),
    });
  }

  return (
    <div className="presenca">
      <label>
        Horas
        <input
          inputMode="decimal"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
          aria-invalid={!!erro}
        />
      </label>
      <button className="primary-button" onClick={registrar}>
        Presente
      </button>
      <button className="text-button" onClick={aoAusencia}>
        Ausente
      </button>
      {erro && <span className="ong-field-error">{erro}</span>}
    </div>
  );
}

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  MapPin,
  UserRound,
  Users,
} from 'lucide-react';
import { CAUSAS, STATUS_CANDIDATURA, rotulo } from '../../api/rotulos';
import { formatarPeriodo, textoVagas } from '../../utils/datas';

/** Painel lateral com os dados completos da oportunidade selecionada. */
export default function DetalheOportunidade({
  oportunidade,
  visivelNoCelular,
  salva,
  minhaCandidatura,
  aoVoltar,
  aoCandidatar,
  aoSalvar,
  aoAbrirOrganizacao,
}) {
  const { titulo, organizacao, local, cidade, uf, inicio, fim, vagas, vagasDisponiveis } =
    oportunidade;
  return (
    <aside
      className={`job-detail ${visivelNoCelular ? 'mobile-visible' : ''}`}
      aria-label="Detalhes da vaga"
    >
      <button className="text-button back-to-results" onClick={aoVoltar}>
        <ArrowLeft size={18} /> Voltar às vagas
      </button>
      <div className="detail-header">
        <h2>{titulo}</h2>
        <button className="organization-link" onClick={aoAbrirOrganizacao}>
          {organizacao.nome}
        </button>
        <p>
          {cidade}, {uf}
        </p>
        <div className="detail-actions">
          {minhaCandidatura ? (
            <span className="detail-tag">
              Você já se candidatou: {rotulo(STATUS_CANDIDATURA, minhaCandidatura.status)}
            </span>
          ) : (
            <button className="primary-button" onClick={aoCandidatar}>
              Quero me candidatar <ArrowRight size={20} />
            </button>
          )}
          <button
            className={`icon-button detail-save ${salva ? 'saved' : ''}`}
            onClick={aoSalvar}
            aria-label={salva ? 'Remover vaga dos salvos' : 'Salvar vaga'}
            aria-pressed={salva}
          >
            <Bookmark size={21} fill={salva ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      <div className="detail-body">
        <section>
          <h3>Dados da vaga</h3>
          <p className="muted">Veja como você pode contribuir com esta oportunidade.</p>
          <div className="detail-meta">
            <CalendarDays size={20} />
            <div>
              <strong>Data e horário</strong>
              <span className="detail-tag">{formatarPeriodo(inicio, fim)}</span>
            </div>
          </div>
          <div className="detail-meta">
            <Users size={20} />
            <div>
              <strong>Vagas</strong>
              <span className="detail-tag">
                {vagasDisponiveis > 0
                  ? `${vagasDisponiveis} de ${vagas} vagas disponíveis`
                  : textoVagas(vagasDisponiveis)}
              </span>
            </div>
          </div>
        </section>
        <section>
          <h3>Localização</h3>
          <p className="inline-icon">
            <MapPin size={19} /> {local} · {cidade}, {uf}
          </p>
        </section>
        <section>
          <h3>Descrição completa da vaga</h3>
          <p className="local-job-text">{oportunidade.descricao}</p>
          {oportunidade.atividades && (
            <>
              <h4>Atividades</h4>
              <p className="local-job-text">{oportunidade.atividades}</p>
            </>
          )}
          {oportunidade.requisitos && (
            <>
              <h4>Requisitos</h4>
              <p className="local-job-text">{oportunidade.requisitos}</p>
            </>
          )}
          <h4>Causa</h4>
          <span className="detail-tag">{rotulo(CAUSAS, oportunidade.causa)}</span>
          {oportunidade.habilidades?.length > 0 && (
            <>
              <h4>Habilidades desejadas</h4>
              <div className="tags">
                {oportunidade.habilidades.map((h) => (
                  <span key={h.id}>{h.nome}</span>
                ))}
              </div>
              <p className="muted">São só uma referência: qualquer pessoa pode se candidatar.</p>
            </>
          )}
        </section>
        {oportunidade.responsavel && (
          <section>
            <h3>Responsável pela vaga</h3>
            <p className="inline-icon">
              <UserRound size={19} /> {oportunidade.responsavel.nome} · {organizacao.nome}
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}

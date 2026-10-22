import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, MapPin, Users } from 'lucide-react';
import { CAUSAS, rotulo } from '../../api/rotulos';
import { formatarPeriodo, textoVagas } from '../../utils/datas';

/** Painel lateral com os dados completos da oportunidade selecionada. */
export default function DetalheOportunidade({
  oportunidade,
  visivelNoCelular,
  salva,
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
          <button className="primary-button" onClick={aoCandidatar}>
            Quero me candidatar <ArrowRight size={20} />
          </button>
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
          <h4>Causa</h4>
          <span className="detail-tag">{rotulo(CAUSAS, oportunidade.causa)}</span>
          <p className="demo-note">
            Esta é uma oportunidade fictícia para demonstração do Voluntare. Nenhuma candidatura
            será enviada.
          </p>
        </section>
      </div>
    </aside>
  );
}

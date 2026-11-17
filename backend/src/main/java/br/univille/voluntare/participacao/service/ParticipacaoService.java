package br.univille.voluntare.participacao.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.candidatura.dto.CandidatoResponse;
import br.univille.voluntare.historico.service.HistoricoService;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.service.AcessoOportunidade;
import br.univille.voluntare.participacao.dto.HistoricoVoluntarioResponse;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.participacao.entity.StatusParticipacao;
import br.univille.voluntare.participacao.repository.ParticipacaoRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import lombok.RequiredArgsConstructor;

/**
 * Presença e horas (regras 4 e 5) e o histórico do voluntário (regra 7).
 * O responsável pela vaga (ou o gestor) registra presença ou ausência de cada participação confirmada,
 * só depois do fim da atividade. O registro é definitivo e vai para o histórico com quem e quando.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ParticipacaoService {

    private final ParticipacaoRepository participacoes;
    private final UsuarioLogadoService logado;
    private final AcessoOportunidade acesso;
    private final HistoricoService historico;

    public CandidatoResponse registrarPresenca(UUID autorId, UUID participacaoId, BigDecimal horas,
            String observacao) {
        Usuario autor = logado.carregar(autorId);
        Participacao participacao = paraRegistrar(autor, participacaoId);

        BigDecimal duracao = duracaoEmHoras(participacao.getCandidatura().getOportunidade());
        if (horas.compareTo(duracao) > 0) {
            throw new DadosInvalidosException(List.of(new CampoErro("horas",
                    "As horas não podem passar da duração da atividade (" + duracao.stripTrailingZeros().toPlainString()
                            + " h).")));
        }

        participacao.registrarPresenca(horas, autor);
        historico.registrarParticipacao(participacao.getId(), StatusParticipacao.CONFIRMADA,
                StatusParticipacao.PRESENTE, autor, limpo(observacao));
        return CandidatoResponse.de(participacao.getCandidatura(), participacao);
    }

    public CandidatoResponse registrarAusencia(UUID autorId, UUID participacaoId, String observacao) {
        Usuario autor = logado.carregar(autorId);
        Participacao participacao = paraRegistrar(autor, participacaoId);
        participacao.registrarAusencia(autor);
        historico.registrarParticipacao(participacao.getId(), StatusParticipacao.CONFIRMADA,
                StatusParticipacao.AUSENTE, autor, limpo(observacao));
        return CandidatoResponse.de(participacao.getCandidatura(), participacao);
    }

    @Transactional(readOnly = true)
    public HistoricoVoluntarioResponse historicoDoVoluntario(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        if (autor.getPapel() != Papel.VOLUNTARIO) {
            throw new AcessoNegadoException("Área exclusiva de voluntários.");
        }
        return HistoricoVoluntarioResponse.de(
                participacoes.findByCandidaturaVoluntarioUsuarioIdOrderByCandidaturaOportunidadeInicioDesc(
                        autor.getId()));
    }

    // ---------- regras comuns ao registro ----------

    private Participacao paraRegistrar(Usuario autor, UUID participacaoId) {
        Participacao participacao = participacoes.findComRelacoesById(participacaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Participação não encontrada."));
        Oportunidade oportunidade = participacao.getCandidatura().getOportunidade();
        acesso.exigirOperar(autor, oportunidade);

        if (oportunidade.getStatus() == StatusOportunidade.CANCELADA) {
            throw new ConflitoException("A oportunidade foi cancelada: não há presença a registrar.");
        }
        if (!participacao.confirmada()) {
            throw new ConflitoException("A presença só pode ser registrada uma vez, em participação confirmada.");
        }
        if (Instant.now().isBefore(oportunidade.getFim())) {
            throw new ConflitoException("A presença só pode ser registrada depois do fim da atividade.");
        }
        return participacao;
    }

    /** Q-09: as horas não passam da duração planejada (fim − início). */
    private static BigDecimal duracaoEmHoras(Oportunidade oportunidade) {
        long minutos = Duration.between(oportunidade.getInicio(), oportunidade.getFim()).toMinutes();
        return BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 2, RoundingMode.DOWN);
    }

    private static String limpo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}

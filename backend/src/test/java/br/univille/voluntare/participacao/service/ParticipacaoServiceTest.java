package br.univille.voluntare.participacao.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.univille.voluntare.Fabrica;
import br.univille.voluntare.historico.service.HistoricoService;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.service.AcessoOportunidade;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.participacao.entity.StatusParticipacao;
import br.univille.voluntare.participacao.repository.ParticipacaoRepository;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;

/**
 * Regras da presença no service, isoladas com Mockito (o "quando fizer sentido" do briefing):
 * as decisões aqui dependem só das datas e das horas, não do banco. O repositório, a regra de acesso
 * e o histórico são simulados; o teste confere a decisão e o que o service mandou gravar.
 * O caminho completo, com banco e HTTP, está em ParticipacaoControllerTest.
 */
@ExtendWith(MockitoExtension.class)
class ParticipacaoServiceTest {

    private static final UUID AUTOR = UUID.randomUUID();
    private static final UUID PARTICIPACAO = UUID.randomUUID();

    @Mock
    private ParticipacaoRepository participacoes;
    @Mock
    private UsuarioLogadoService logado;
    @Mock
    private AcessoOportunidade acesso;
    @Mock
    private HistoricoService historico;

    @InjectMocks
    private ParticipacaoService service;

    private final Usuario responsavel = Fabrica.gestor();
    private final Instant ontem = Instant.now().minus(1, ChronoUnit.DAYS);

    /** Atividade de ontem com a duração informada, e a participação confirmada nela. */
    private Participacao atividadeDeOntem(StatusOportunidade status, long minutos) {
        Participacao participacao = Fabrica.participacaoConfirmada(status, ontem, ontem.plus(minutos, ChronoUnit.MINUTES));
        when(logado.carregar(AUTOR)).thenReturn(responsavel);
        when(participacoes.findComRelacoesById(PARTICIPACAO)).thenReturn(Optional.of(participacao));
        return participacao;
    }

    @Test
    void presencaDentroDaDuracaoEhGravadaComHistorico() {
        Participacao participacao = atividadeDeOntem(StatusOportunidade.ABERTA, 240);

        service.registrarPresenca(AUTOR, PARTICIPACAO, new BigDecimal("3.5"), " Saiu mais cedo ");

        assertThat(participacao.getStatus()).isEqualTo(StatusParticipacao.PRESENTE);
        verify(historico).registrarParticipacao(participacao.getId(), StatusParticipacao.CONFIRMADA,
                StatusParticipacao.PRESENTE, responsavel, "Saiu mais cedo");
    }

    @Test
    void duracaoComMinutosAceitaOLimiteExato() {
        // 2h30 = 2,5 horas: 2,5 passa
        Participacao participacao = atividadeDeOntem(StatusOportunidade.ENCERRADA, 150);
        service.registrarPresenca(AUTOR, PARTICIPACAO, new BigDecimal("2.50"), null);
        assertThat(participacao.getHorasRealizadas()).isEqualByComparingTo("2.5");
    }

    @Test
    void horasAcimaDaDuracaoNaoGravamNada() {
        // 2h30 = 2,5 horas: 2,51 não passa
        Participacao participacao = atividadeDeOntem(StatusOportunidade.ABERTA, 150);

        DadosInvalidosException erro = catchThrowableOfType(DadosInvalidosException.class,
                () -> service.registrarPresenca(AUTOR, PARTICIPACAO, new BigDecimal("2.51"), null));

        assertThat(erro.getCampos()).extracting(CampoErro::mensagem)
                .containsExactly("As horas não podem passar da duração da atividade (2.5 h).");
        assertThat(participacao.getStatus()).isEqualTo(StatusParticipacao.CONFIRMADA);
        verifyNoInteractions(historico);
    }

    @Test
    void vagaCanceladaNaoRecebePresenca() {
        atividadeDeOntem(StatusOportunidade.CANCELADA, 240);
        assertThatThrownBy(() -> service.registrarAusencia(AUTOR, PARTICIPACAO, null))
                .isInstanceOf(ConflitoException.class);
        verifyNoInteractions(historico);
    }

    @Test
    void antesDoFimDaAtividadeEhConflito() {
        Instant daquiAUmaHora = Instant.now().plus(1, ChronoUnit.HOURS);
        Participacao participacao = Fabrica.participacaoConfirmada(StatusOportunidade.ABERTA,
                daquiAUmaHora.minus(3, ChronoUnit.HOURS), daquiAUmaHora);
        when(logado.carregar(AUTOR)).thenReturn(responsavel);
        when(participacoes.findComRelacoesById(PARTICIPACAO)).thenReturn(Optional.of(participacao));

        assertThatThrownBy(() -> service.registrarPresenca(AUTOR, PARTICIPACAO, BigDecimal.ONE, null))
                .isInstanceOf(ConflitoException.class)
                .hasMessage("A presença só pode ser registrada depois do fim da atividade.");
        verifyNoInteractions(historico);
    }
}

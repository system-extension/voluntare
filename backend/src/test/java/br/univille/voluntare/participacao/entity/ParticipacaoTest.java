package br.univille.voluntare.participacao.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;

import br.univille.voluntare.Fabrica;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.usuario.entity.Usuario;

/** Regra 6 (prazo de devolução da vaga) e registro de presença (regras 4 e 5) na própria participação. */
class ParticipacaoTest {

    private final Instant inicio = Instant.now().plus(3, ChronoUnit.DAYS);
    private final Instant limite = inicio.minus(48, ChronoUnit.HOURS);

    private Participacao confirmada() {
        return Fabrica.participacaoConfirmada(StatusOportunidade.ABERTA, inicio, inicio.plus(4, ChronoUnit.HOURS));
    }

    @Test
    void desistirAntesDoLimiteDevolveAVaga() {
        Participacao participacao = confirmada();
        Instant agora = limite.minus(1, ChronoUnit.HOURS);

        assertThat(participacao.cancelar(agora, limite)).isEqualTo(StatusParticipacao.CANCELADA);
        assertThat(participacao.getCanceladoEm()).isEqualTo(agora);
    }

    @Test
    void desistirNoProprioLimiteAindaDevolve() {
        assertThat(confirmada().cancelar(limite, limite)).isEqualTo(StatusParticipacao.CANCELADA);
    }

    @Test
    void desistirDepoisDoLimiteNaoDevolve() {
        assertThat(confirmada().cancelar(limite.plusSeconds(1), limite))
                .isEqualTo(StatusParticipacao.CANCELADA_TARDIA);
    }

    @Test
    void naoDesisteDuasVezes() {
        Participacao participacao = confirmada();
        participacao.cancelar(limite.minus(1, ChronoUnit.DAYS), limite);
        assertThatThrownBy(() -> participacao.cancelar(limite, limite)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void presencaGuardaHorasQuemEQuando() {
        Participacao participacao = confirmada();
        Usuario responsavel = Fabrica.gestor();

        participacao.registrarPresenca(new BigDecimal("3.50"), responsavel);

        assertThat(participacao.getStatus()).isEqualTo(StatusParticipacao.PRESENTE);
        assertThat(participacao.getHorasRealizadas()).isEqualByComparingTo("3.5");
        assertThat(participacao.getRegistradoPor()).isSameAs(responsavel);
        assertThat(participacao.getRegistradoEm()).isNotNull();
    }

    @Test
    void registroEhDefinitivo() {
        Participacao participacao = confirmada();
        participacao.registrarAusencia(Fabrica.gestor());
        assertThatThrownBy(() -> participacao.registrarPresenca(BigDecimal.ONE, Fabrica.gestor()))
                .isInstanceOf(IllegalStateException.class);
    }
}

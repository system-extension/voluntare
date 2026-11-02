package br.univille.voluntare.oportunidade.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;

import br.univille.voluntare.Fabrica;
import br.univille.voluntare.oportunidade.dto.OportunidadeRequest;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;

/** Regras que dependem só da própria vaga: campos para publicar, período e fluxo de status. */
class OportunidadeTest {

    private final Instant agora = Instant.now();
    private final Instant amanha = agora.plus(1, ChronoUnit.DAYS);

    @Test
    void rascunhoSoComTituloAindaNaoPodeSerPublicado() {
        assertThat(Fabrica.rascunho().pendenciasParaAbrir(agora, true))
                .extracting(CampoErro::campo)
                .containsExactlyInAnyOrder("descricao", "causa", "local", "cidade", "uf", "inicio", "fim", "vagas");
    }

    @Test
    void vagaCompletaEFuturaNaoTemPendencias() {
        Oportunidade vaga = Fabrica.vaga(StatusOportunidade.ABERTA, amanha, amanha.plus(4, ChronoUnit.HOURS));
        assertThat(vaga.pendenciasParaAbrir(agora, true)).isEmpty();
    }

    @Test
    void inicioNoPassadoSoEhCobradoQuandoPedido() {
        // Na edição de uma vaga que já começou, o início só é conferido se tiver mudado (D-20)
        Instant ontem = agora.minus(1, ChronoUnit.DAYS);
        Oportunidade vaga = Fabrica.vaga(StatusOportunidade.ABERTA, ontem, ontem.plus(4, ChronoUnit.HOURS));
        assertThat(vaga.pendenciasParaAbrir(agora, true)).extracting(CampoErro::campo).containsExactly("inicio");
        assertThat(vaga.pendenciasParaAbrir(agora, false)).isEmpty();
    }

    @Test
    void terminoPrecisaSerDepoisDoInicioAteNoRascunho() {
        Oportunidade vaga = Fabrica.vaga(StatusOportunidade.RASCUNHO, amanha, amanha.minus(1, ChronoUnit.HOURS));
        assertThat(vaga.pendenciasDoPeriodo()).extracting(CampoErro::campo).containsExactly("fim");
    }

    @Test
    void soRascunhoEAbertaSaoEditaveis() {
        assertThat(Fabrica.rascunho().editavel()).isTrue();
        assertThat(Fabrica.vaga(StatusOportunidade.ABERTA, amanha, amanha.plus(1, ChronoUnit.HOURS)).editavel()).isTrue();
        assertThat(Fabrica.vaga(StatusOportunidade.ENCERRADA, amanha, amanha.plus(1, ChronoUnit.HOURS)).editavel()).isFalse();
    }

    @Test
    void mudancaForaDoFluxoEhRecusada() {
        Oportunidade encerrada = Fabrica.vaga(StatusOportunidade.ENCERRADA, amanha, amanha.plus(1, ChronoUnit.HOURS));
        assertThatThrownBy(() -> encerrada.alterarStatus(StatusOportunidade.ABERTA))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void textoEmBrancoNaoContaComoPreenchido() {
        // Um campo só com espaços vira vazio: a vaga continua pendente de descrição e endereço
        Oportunidade vaga = Fabrica.rascunho();
        vaga.aplicar(new OportunidadeRequest("  Mutirão  ", "   ", null, null, Causa.EDUCACAO, " ", "Joinville",
                "SC", amanha, amanha.plus(2, ChronoUnit.HOURS), 3, null, null, false));

        assertThat(vaga.getTitulo()).isEqualTo("Mutirão");
        assertThat(vaga.pendenciasParaAbrir(agora, true)).extracting(CampoErro::campo)
                .containsExactlyInAnyOrder("descricao", "local");
    }
}

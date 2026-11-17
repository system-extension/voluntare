package br.univille.voluntare.shared.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Normalização da busca: o lado Java precisa casar com a função sem_acento() do banco (V7). */
class TextosTest {

    @Test
    void tiraAcentosEPassaParaMinusculas() {
        assertThat(Textos.semAcento("Educação AMBIENTAL em São José")).isEqualTo("educacao ambiental em sao jose");
    }

    @Test
    void curingasDoLikeViramCaracteresComuns() {
        // Sem o escape, "_" casaria com qualquer letra e "%" com qualquer trecho
        assertThat(Textos.padraoContendo("  50%_Off\\ ")).isEqualTo("%50\\%\\_off\\\\%");
    }

    @Test
    void textoSoComEspacosNaoTemConteudo() {
        assertThat(Textos.temConteudo("   ")).isFalse();
        assertThat(Textos.temConteudo(null)).isFalse();
        assertThat(Textos.temConteudo("x")).isTrue();
    }
}

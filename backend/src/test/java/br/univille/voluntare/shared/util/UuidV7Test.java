package br.univille.voluntare.shared.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

/** UUID v7 (D-21): versão e variante corretas, e ids mais novos ordenam depois dos mais antigos. */
class UuidV7Test {

    @Test
    void temVersao7EVarianteRfc() {
        UUID id = UuidV7.gerar();
        assertThat(id.version()).isEqualTo(7);
        assertThat(id.variant()).isEqualTo(2);
    }

    @Test
    void comecaPeloInstanteDaCriacao() {
        long antes = System.currentTimeMillis();
        UUID id = UuidV7.gerar();
        long depois = System.currentTimeMillis();

        long instante = id.getMostSignificantBits() >>> 16;
        assertThat(instante).isBetween(antes, depois);
    }

    @Test
    void idCriadoDepoisOrdenaDepois() throws InterruptedException {
        UUID primeiro = UuidV7.gerar();
        Thread.sleep(2);
        UUID segundo = UuidV7.gerar();
        assertThat(segundo).isGreaterThan(primeiro);
    }
}

package br.univille.voluntare.oportunidade.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** Fluxo de status da vaga (RN-24): rascunho → aberta ou cancelada; aberta → encerrada ou cancelada. */
class StatusOportunidadeTest {

    @ParameterizedTest(name = "{0} → {1}: {2}")
    @CsvSource({
            "RASCUNHO,  ABERTA,    true",
            "RASCUNHO,  CANCELADA, true",
            "RASCUNHO,  ENCERRADA, false",
            "ABERTA,    ENCERRADA, true",
            "ABERTA,    CANCELADA, true",
            "ABERTA,    RASCUNHO,  false",
            "ENCERRADA, ABERTA,    false",
            "ENCERRADA, CANCELADA, false",
            "CANCELADA, ABERTA,    false",
            "CANCELADA, RASCUNHO,  false",
    })
    void segueOFluxoDoDer(StatusOportunidade de, StatusOportunidade para, boolean permitido) {
        assertThat(de.podeIrPara(para)).isEqualTo(permitido);
    }
}

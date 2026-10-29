package br.univille.voluntare.oportunidade.entity;

import java.util.Arrays;
import java.util.List;

import br.univille.voluntare.shared.util.Textos;

/** Causas fixas da oportunidade (CHECK ck_oportunidade_causa). O rótulo é o mesmo da interface. */
public enum Causa {
    EDUCACAO("Educação"),
    MEIO_AMBIENTE("Meio ambiente"),
    ASSISTENCIA_SOCIAL("Assistência social"),
    ANIMAIS("Animais"),
    COMUNICACAO("Comunicação");

    private final String rotulo;

    Causa(String rotulo) {
        this.rotulo = rotulo;
    }

    public String getRotulo() {
        return rotulo;
    }

    /** Causas cujo rótulo contém o texto, sem diferenciar acentos e maiúsculas ("educacao" → EDUCACAO). */
    public static List<Causa> comRotuloContendo(String texto) {
        String procurado = Textos.semAcento(texto.trim());
        return Arrays.stream(values())
                .filter(causa -> Textos.semAcento(causa.rotulo).contains(procurado))
                .toList();
    }
}

package br.univille.voluntare.shared.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/** Ajudantes de texto para a busca. */
public final class Textos {

    private static final Pattern MARCAS = Pattern.compile("\\p{M}+");

    private Textos() {
    }

    public static boolean temConteudo(String texto) {
        return texto != null && !texto.isBlank();
    }

    /** Mesmo resultado da função sem_acento() do banco (V7): minúsculas e sem acentos. */
    public static String semAcento(String texto) {
        String decomposto = Normalizer.normalize(texto, Normalizer.Form.NFD);
        return MARCAS.matcher(decomposto).replaceAll("").toLowerCase(Locale.ROOT);
    }

    /**
     * Padrão de LIKE para "contém o texto", com escape '\'.
     * % e _ digitados pelo usuário viram caracteres comuns, não curingas.
     */
    public static String padraoContendo(String texto) {
        String escapado = semAcento(texto.trim())
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escapado + "%";
    }
}

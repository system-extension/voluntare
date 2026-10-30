package br.univille.voluntare.shared.util;

import java.security.SecureRandom;
import java.util.UUID;

/**
 * UUID versão 7 (RFC 9562): os primeiros 48 bits são o instante em milissegundos, o resto é aleatório.
 * Por começar pelo tempo, ids novos entram no fim do índice, como acontecia com o IDENTITY (D-21).
 */
public final class UuidV7 {

    private static final SecureRandom ALEATORIO = new SecureRandom();

    private UuidV7() {
    }

    public static UUID gerar() {
        long milissegundos = System.currentTimeMillis();
        // 48 bits de tempo | versão 7 (4 bits) | 12 bits aleatórios
        long maisSignificativos = (milissegundos << 16) | 0x7000L | (ALEATORIO.nextInt() & 0x0FFFL);
        // variante RFC (bits 10) | 62 bits aleatórios
        long menosSignificativos = (ALEATORIO.nextLong() & 0x3FFF_FFFF_FFFF_FFFFL) | 0x8000_0000_0000_0000L;
        return new UUID(maisSignificativos, menosSignificativos);
    }
}

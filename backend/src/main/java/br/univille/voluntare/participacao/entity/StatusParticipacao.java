package br.univille.voluntare.participacao.entity;

/**
 * CHECK ck_participacao_status. CONFIRMADA → PRESENTE, AUSENTE, CANCELADA ou CANCELADA_TARDIA.
 * CANCELADA devolve a vaga; CANCELADA_TARDIA não (passou do prazo da regra 6).
 */
public enum StatusParticipacao {
    CONFIRMADA,
    PRESENTE,
    AUSENTE,
    CANCELADA,
    CANCELADA_TARDIA
}

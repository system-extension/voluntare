package br.univille.voluntare.candidatura.entity;

/** CHECK ck_candidatura_status. PENDENTE → ACEITA, REJEITADA ou CANCELADA; os demais são finais. */
public enum StatusCandidatura {
    PENDENTE,
    ACEITA,
    REJEITADA,
    CANCELADA
}

package br.univille.voluntare.oportunidade.entity;

/** CHECK ck_oportunidade_status. Só ABERTA aparece na busca pública. */
public enum StatusOportunidade {
    RASCUNHO,
    ABERTA,
    ENCERRADA,
    CANCELADA
}

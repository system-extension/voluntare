package br.univille.voluntare.oportunidade.entity;

import java.util.Set;

/**
 * CHECK ck_oportunidade_status. Só ABERTA aparece na busca pública.
 * Fluxo (docs/der/der.md): RASCUNHO → ABERTA ou CANCELADA; ABERTA → ENCERRADA ou CANCELADA. Os demais são finais.
 */
public enum StatusOportunidade {
    RASCUNHO,
    ABERTA,
    ENCERRADA,
    CANCELADA;

    public boolean podeIrPara(StatusOportunidade novo) {
        return switch (this) {
            case RASCUNHO -> Set.of(ABERTA, CANCELADA).contains(novo);
            case ABERTA -> Set.of(ENCERRADA, CANCELADA).contains(novo);
            case ENCERRADA, CANCELADA -> false;
        };
    }
}

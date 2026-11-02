package br.univille.voluntare.oportunidade.dto;

import jakarta.validation.constraints.Size;

/** Motivo opcional de uma mudança de status. Vai para a observação do histórico. */
public record MotivoRequest(
        @Size(max = 500, message = "O motivo pode ter até 500 caracteres.") String motivo) {
}

package br.univille.voluntare.candidatura.dto;

import java.time.Instant;
import java.util.UUID;

import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.participacao.entity.StatusParticipacao;

/** Situação da participação que nasceu do aceite. Nula enquanto a candidatura não foi aceita. */
public record ParticipacaoResumo(UUID id, StatusParticipacao status, Instant canceladoEm) {

    public static ParticipacaoResumo de(Participacao p) {
        return p == null ? null : new ParticipacaoResumo(p.getId(), p.getStatus(), p.getCanceladoEm());
    }
}

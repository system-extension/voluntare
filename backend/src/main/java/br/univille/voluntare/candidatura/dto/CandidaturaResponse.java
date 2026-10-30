package br.univille.voluntare.candidatura.dto;

import java.time.Instant;
import java.util.UUID;

import br.univille.voluntare.candidatura.entity.Candidatura;
import br.univille.voluntare.candidatura.entity.StatusCandidatura;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.participacao.entity.Participacao;

/** Candidatura vista pelo voluntário: a vaga resumida e, se aceita, a participação. */
public record CandidaturaResponse(UUID id, StatusCandidatura status, Instant criadoEm, Instant decididoEm,
        Vaga oportunidade, ParticipacaoResumo participacao) {

    public record Vaga(UUID id, String titulo, String organizacao, String cidade, String uf, Instant inicio,
            Instant fim, StatusOportunidade status) {
    }

    public static CandidaturaResponse de(Candidatura c, Participacao participacao) {
        Oportunidade o = c.getOportunidade();
        Vaga vaga = new Vaga(o.getId(), o.getTitulo(), o.getOrganizacao().getNome(), o.getCidade(), o.getUf(),
                o.getInicio(), o.getFim(), o.getStatus());
        return new CandidaturaResponse(c.getId(), c.getStatus(), c.getCriadoEm(), c.getDecididoEm(), vaga,
                ParticipacaoResumo.de(participacao));
    }
}

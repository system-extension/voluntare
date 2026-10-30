package br.univille.voluntare.candidatura.dto;

import java.time.Instant;
import java.util.UUID;

import br.univille.voluntare.candidatura.entity.Candidatura;
import br.univille.voluntare.candidatura.entity.StatusCandidatura;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;

/** Candidatura vista pela organização: quem é o voluntário e como falar com ele. */
public record CandidatoResponse(UUID id, StatusCandidatura status, Instant criadoEm, Instant decididoEm,
        Voluntario voluntario, ParticipacaoResumo participacao) {

    public record Voluntario(UUID id, String nome, String email, String telefone, String cidade,
            String disponibilidade) {
    }

    public static CandidatoResponse de(Candidatura c, Participacao participacao) {
        PerfilVoluntario perfil = c.getVoluntario();
        Voluntario voluntario = new Voluntario(perfil.getUsuarioId(), perfil.getUsuario().getNome(),
                perfil.getUsuario().getEmail(), perfil.getTelefone(), perfil.getCidade(), perfil.getDisponibilidade());
        return new CandidatoResponse(c.getId(), c.getStatus(), c.getCriadoEm(), c.getDecididoEm(), voluntario,
                ParticipacaoResumo.de(participacao));
    }
}

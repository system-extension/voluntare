package br.univille.voluntare.voluntario.dto;

import java.util.List;
import java.util.UUID;

import br.univille.voluntare.voluntario.entity.Habilidade;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;
import br.univille.voluntare.voluntario.entity.TipoHabilidade;
import br.univille.voluntare.voluntario.entity.VoluntarioHabilidade;

/** Perfil do voluntário: o que ele sabe fazer (habilidades) e o que quer aprender (interesses). */
public record PerfilResponse(UUID id, String nome, String email, String telefone, String cidade,
        String disponibilidade, List<HabilidadeResponse> habilidades, List<HabilidadeResponse> interesses) {

    public static PerfilResponse de(PerfilVoluntario perfil) {
        return new PerfilResponse(perfil.getUsuarioId(), perfil.getUsuario().getNome(), perfil.getUsuario().getEmail(),
                perfil.getTelefone(), perfil.getCidade(), perfil.getDisponibilidade(),
                HabilidadeResponse.lista(doTipo(perfil, TipoHabilidade.HABILIDADE)),
                HabilidadeResponse.lista(doTipo(perfil, TipoHabilidade.INTERESSE)));
    }

    private static List<Habilidade> doTipo(PerfilVoluntario perfil, TipoHabilidade tipo) {
        return perfil.getHabilidades().stream()
                .filter(vh -> vh.getTipo() == tipo)
                .map(VoluntarioHabilidade::getHabilidade)
                .toList();
    }
}

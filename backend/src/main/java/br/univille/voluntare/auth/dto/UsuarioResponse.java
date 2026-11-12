package br.univille.voluntare.auth.dto;

import java.util.UUID;

import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;

/** Quem está logado. organizacao é nula para voluntário. */
public record UsuarioResponse(UUID id, String nome, String email, Papel papel, OrganizacaoResumo organizacao) {

    public record OrganizacaoResumo(UUID id, String nome) {
    }

    public static UsuarioResponse de(Usuario u) {
        OrganizacaoResumo organizacao = u.getOrganizacao() == null
                ? null
                : new OrganizacaoResumo(u.getOrganizacao().getId(), u.getOrganizacao().getNome());
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), organizacao);
    }
}

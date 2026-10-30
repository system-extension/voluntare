package br.univille.voluntare.auth.dto;

import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;

/** Quem está logado. organizacao é nula para voluntário. */
public record UsuarioResponse(Long id, String nome, String email, Papel papel, OrganizacaoResumo organizacao) {

    public record OrganizacaoResumo(Long id, String nome) {
    }

    public static UsuarioResponse de(Usuario u) {
        OrganizacaoResumo organizacao = u.getOrganizacao() == null
                ? null
                : new OrganizacaoResumo(u.getOrganizacao().getId(), u.getOrganizacao().getNome());
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), organizacao);
    }
}

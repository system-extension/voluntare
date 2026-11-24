package br.univille.voluntare.organizacao.dto;

import java.util.UUID;

import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;

/** Pessoa da equipe. vagasEmAndamento conta as vagas em rascunho ou abertas pelas quais ela responde. */
public record MembroEquipeResponse(UUID id, String nome, String email, Papel papel, boolean ativo,
        long vagasEmAndamento) {

    public static MembroEquipeResponse de(Usuario u, long vagasEmAndamento) {
        return new MembroEquipeResponse(u.getId(), u.getNome(), u.getEmail(), u.getPapel(), u.isAtivo(),
                vagasEmAndamento);
    }
}

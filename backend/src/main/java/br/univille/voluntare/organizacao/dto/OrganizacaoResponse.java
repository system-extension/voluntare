package br.univille.voluntare.organizacao.dto;

import java.util.UUID;

import br.univille.voluntare.organizacao.entity.Organizacao;

public record OrganizacaoResponse(UUID id, String nome, String descricao, String cidade, String uf,
        String email, String telefone) {

    public static OrganizacaoResponse de(Organizacao o) {
        return new OrganizacaoResponse(o.getId(), o.getNome(), o.getDescricao(), o.getCidade(), o.getUf(),
                o.getEmail(), o.getTelefone());
    }
}

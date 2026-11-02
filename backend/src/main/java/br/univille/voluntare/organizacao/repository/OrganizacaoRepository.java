package br.univille.voluntare.organizacao.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.organizacao.entity.Organizacao;

public interface OrganizacaoRepository extends JpaRepository<Organizacao, UUID> {

    /** Mesmo critério do índice ux_organizacao_nome: lower(nome). */
    boolean existsByNomeIgnoreCase(String nome);
}

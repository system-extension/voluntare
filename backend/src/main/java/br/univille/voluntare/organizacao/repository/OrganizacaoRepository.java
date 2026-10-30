package br.univille.voluntare.organizacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.organizacao.entity.Organizacao;

public interface OrganizacaoRepository extends JpaRepository<Organizacao, Long> {

    /** Mesmo critério do índice ux_organizacao_nome: lower(nome). */
    boolean existsByNomeIgnoreCase(String nome);
}

package br.univille.voluntare.candidatura.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.univille.voluntare.candidatura.entity.Candidatura;

public interface CandidaturaRepository extends JpaRepository<Candidatura, UUID> {

    boolean existsByOportunidadeIdAndVoluntarioUsuarioId(UUID oportunidadeId, UUID voluntarioId);

    /** "Minhas candidaturas": com a vaga e a organização no mesmo SELECT. */
    @EntityGraph(attributePaths = {"oportunidade", "oportunidade.organizacao"})
    List<Candidatura> findByVoluntarioUsuarioIdOrderByCriadoEmDesc(UUID voluntarioId);

    /** Candidatos de uma vaga, na ordem em que chegaram, com o perfil e a conta de cada um. */
    @EntityGraph(attributePaths = {"voluntario", "voluntario.usuario"})
    List<Candidatura> findByOportunidadeIdOrderByCriadoEmAsc(UUID oportunidadeId);

    @EntityGraph(attributePaths = {"oportunidade", "voluntario", "voluntario.usuario"})
    Optional<Candidatura> findComRelacoesById(UUID id);

    /** Só o id da vaga, sem carregar nada: usado para travar a vaga antes de ler a candidatura. */
    @Query("SELECT c.oportunidade.id FROM Candidatura c WHERE c.id = :id")
    Optional<UUID> idDaOportunidade(@Param("id") UUID id);
}

package br.univille.voluntare.oportunidade.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;

public interface OportunidadeRepository
        extends JpaRepository<Oportunidade, Long>, JpaSpecificationExecutor<Oportunidade> {

    /** Busca com filtros. O EntityGraph traz a organização no mesmo SELECT (sem uma consulta por linha). */
    @Override
    @EntityGraph(attributePaths = "organizacao")
    Page<Oportunidade> findAll(Specification<Oportunidade> spec, Pageable pageable);

    @EntityGraph(attributePaths = "organizacao")
    Optional<Oportunidade> findByIdAndStatusNot(Long id, StatusOportunidade status);

    /**
     * Vagas ocupadas por oportunidade, numa consulta só para a página inteira.
     * Ocupa vaga toda participação que não foi devolvida a tempo: CANCELADA_TARDIA continua ocupando.
     * Devolve linhas [oportunidade_id, quantidade]; quem não tem participação não aparece.
     */
    @Query(value = """
            SELECT c.oportunidade_id, count(*)
            FROM participacao p
            JOIN candidatura c ON c.id = p.candidatura_id
            WHERE c.oportunidade_id IN (:ids)
              AND p.status <> 'CANCELADA'
            GROUP BY c.oportunidade_id
            """, nativeQuery = true)
    List<Object[]> contarVagasOcupadas(@Param("ids") Collection<Long> ids);
}

package br.univille.voluntare.oportunidade.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import jakarta.persistence.LockModeType;

public interface OportunidadeRepository
        extends JpaRepository<Oportunidade, UUID>, JpaSpecificationExecutor<Oportunidade> {

    /** Busca com filtros. O EntityGraph traz organização e responsável no mesmo SELECT (sem uma consulta por linha). */
    @Override
    @EntityGraph(attributePaths = {"organizacao", "responsavel"})
    Page<Oportunidade> findAll(Specification<Oportunidade> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"organizacao", "responsavel"})
    Optional<Oportunidade> findByIdAndStatusNot(UUID id, StatusOportunidade status);

    @EntityGraph(attributePaths = {"organizacao", "responsavel"})
    Optional<Oportunidade> findComRelacoesById(UUID id);

    /** Área da organização: todas as vagas dela (visão do gestor). */
    @EntityGraph(attributePaths = {"organizacao", "responsavel"})
    List<Oportunidade> findByOrganizacaoIdOrderByCriadoEmDescIdDesc(UUID organizacaoId);

    /** Área da organização: só as vagas pelas quais a pessoa responde (visão do coordenador). */
    @EntityGraph(attributePaths = {"organizacao", "responsavel"})
    List<Oportunidade> findByOrganizacaoIdAndResponsavelIdOrderByCriadoEmDescIdDesc(UUID organizacaoId,
            UUID responsavelId);

    /**
     * SELECT ... FOR UPDATE: trava a linha da vaga até o fim da transação.
     * Dois aceites ao mesmo tempo na mesma vaga ficam em fila; o segundo só conta as vagas
     * depois que o primeiro gravou, e não passa do limite (regra 3).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Oportunidade o WHERE o.id = :id")
    Optional<Oportunidade> travar(@Param("id") UUID id);

    /**
     * Vagas ocupadas por oportunidade, numa consulta só para a lista inteira.
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
    List<Object[]> contarVagasOcupadas(@Param("ids") Collection<UUID> ids);

    /** Mapa id → vagas ocupadas. Quem não aparece no mapa tem zero. */
    default Map<UUID, Long> vagasOcupadas(Collection<Oportunidade> oportunidades) {
        if (oportunidades.isEmpty()) {
            return Map.of();
        }
        List<UUID> ids = oportunidades.stream().map(Oportunidade::getId).toList();
        return contarVagasOcupadas(ids).stream()
                .collect(Collectors.toMap(
                        linha -> (UUID) linha[0],
                        linha -> ((Number) linha[1]).longValue()));
    }
}

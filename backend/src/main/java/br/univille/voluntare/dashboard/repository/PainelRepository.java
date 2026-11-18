package br.univille.voluntare.dashboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import br.univille.voluntare.oportunidade.entity.Oportunidade;

/**
 * Consultas do painel (RN-54 a RN-56). Tudo é calculado na hora, sem tabela própria.
 * todas = true olha a organização inteira (gestor); false, só as vagas de responsavelId (coordenador).
 */
public interface PainelRepository extends Repository<Oportunidade, UUID> {

    /**
     * Linhas [status, preenchida, quantidade]. preenchida só vale para vaga aberta sem lugar livre.
     * Ocupa lugar toda participação que não foi devolvida (só CANCELADA libera, RN-31).
     */
    @Query(value = """
            SELECT v.status, v.preenchida, count(*)
            FROM (
                SELECT o.status,
                       (o.status = 'ABERTA' AND o.vagas <= (
                            SELECT count(*) FROM participacao p
                            JOIN candidatura c ON c.id = p.candidatura_id
                            WHERE c.oportunidade_id = o.id AND p.status <> 'CANCELADA')) AS preenchida
                FROM oportunidade o
                WHERE o.organizacao_id = :organizacaoId AND (:todas OR o.responsavel_id = :responsavelId)
            ) v
            GROUP BY v.status, v.preenchida
            """, nativeQuery = true)
    List<Object[]> vagasPorStatus(@Param("organizacaoId") UUID organizacaoId, @Param("todas") boolean todas,
            @Param("responsavelId") UUID responsavelId);

    /** Candidaturas esperando decisão em vagas abertas. */
    @Query(value = """
            SELECT count(*)
            FROM candidatura c
            JOIN oportunidade o ON o.id = c.oportunidade_id
            WHERE o.organizacao_id = :organizacaoId AND (:todas OR o.responsavel_id = :responsavelId)
              AND o.status = 'ABERTA' AND c.status = 'PENDENTE'
            """, nativeQuery = true)
    long candidaturasPendentes(@Param("organizacaoId") UUID organizacaoId, @Param("todas") boolean todas,
            @Param("responsavelId") UUID responsavelId);

    /** Linhas [status, quantidade, horas]. As horas só existem nas presenças. */
    @Query(value = """
            SELECT p.status, count(*), coalesce(sum(p.horas_realizadas), 0)
            FROM participacao p
            JOIN candidatura c ON c.id = p.candidatura_id
            JOIN oportunidade o ON o.id = c.oportunidade_id
            WHERE o.organizacao_id = :organizacaoId AND (:todas OR o.responsavel_id = :responsavelId)
            GROUP BY p.status
            """, nativeQuery = true)
    List<Object[]> participacoesPorStatus(@Param("organizacaoId") UUID organizacaoId,
            @Param("todas") boolean todas, @Param("responsavelId") UUID responsavelId);
}

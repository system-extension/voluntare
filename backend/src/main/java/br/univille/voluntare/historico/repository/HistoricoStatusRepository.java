package br.univille.voluntare.historico.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.historico.entity.HistoricoStatus;

public interface HistoricoStatusRepository extends JpaRepository<HistoricoStatus, UUID> {

    /** Linha do tempo de uma oportunidade, da criação para a mudança mais recente. */
    @EntityGraph(attributePaths = "alteradoPor")
    List<HistoricoStatus> findByOportunidadeIdOrderByAlteradoEmAscIdAsc(UUID oportunidadeId);
}

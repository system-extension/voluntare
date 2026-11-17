package br.univille.voluntare.participacao.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.participacao.entity.Participacao;

public interface ParticipacaoRepository extends JpaRepository<Participacao, UUID> {

    Optional<Participacao> findByCandidaturaId(UUID candidaturaId);

    List<Participacao> findByCandidaturaIdIn(Collection<UUID> candidaturaIds);

    /** Para registrar presença: a vaga (para conferir acesso e datas) e o voluntário vêm junto. */
    @EntityGraph(attributePaths = {"candidatura", "candidatura.oportunidade", "candidatura.voluntario",
            "candidatura.voluntario.usuario"})
    Optional<Participacao> findComRelacoesById(UUID id);

    /** Histórico do voluntário: da atividade mais recente para a mais antiga, com vaga e organização. */
    @EntityGraph(attributePaths = {"candidatura", "candidatura.oportunidade", "candidatura.oportunidade.organizacao"})
    List<Participacao> findByCandidaturaVoluntarioUsuarioIdOrderByCandidaturaOportunidadeInicioDesc(UUID voluntarioId);
}

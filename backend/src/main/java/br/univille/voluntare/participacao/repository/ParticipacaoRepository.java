package br.univille.voluntare.participacao.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.participacao.entity.Participacao;

public interface ParticipacaoRepository extends JpaRepository<Participacao, UUID> {

    Optional<Participacao> findByCandidaturaId(UUID candidaturaId);

    List<Participacao> findByCandidaturaIdIn(Collection<UUID> candidaturaIds);
}

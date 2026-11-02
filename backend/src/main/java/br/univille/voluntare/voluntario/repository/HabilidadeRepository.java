package br.univille.voluntare.voluntario.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.voluntario.entity.Habilidade;

public interface HabilidadeRepository extends JpaRepository<Habilidade, UUID> {

    List<Habilidade> findAllByOrderByNomeAsc();
}

package br.univille.voluntare.voluntario.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.voluntario.entity.PerfilVoluntario;

public interface PerfilVoluntarioRepository extends JpaRepository<PerfilVoluntario, UUID> {

    /** Perfil com a conta e as habilidades no mesmo SELECT. */
    @EntityGraph(attributePaths = {"usuario", "habilidades", "habilidades.habilidade"})
    Optional<PerfilVoluntario> findCompletoByUsuarioId(UUID usuarioId);
}

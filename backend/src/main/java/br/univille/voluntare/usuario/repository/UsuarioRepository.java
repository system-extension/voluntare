package br.univille.voluntare.usuario.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.usuario.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    /** Mesmo critério do índice ux_usuario_email: lower(email). */
    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findComOrganizacaoById(UUID id);
}

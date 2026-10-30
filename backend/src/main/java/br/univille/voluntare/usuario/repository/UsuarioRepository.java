package br.univille.voluntare.usuario.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.usuario.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Mesmo critério do índice ux_usuario_email: lower(email). */
    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findComOrganizacaoById(Long id);
}

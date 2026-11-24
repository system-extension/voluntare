package br.univille.voluntare.usuario.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.univille.voluntare.usuario.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    /** Mesmo critério do índice ux_usuario_email: lower(email). */
    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "organizacao")
    Optional<Usuario> findComOrganizacaoById(UUID id);

    /** Equipe da organização: gestores primeiro, depois coordenadores, em ordem de nome. */
    @Query("SELECT u FROM Usuario u WHERE u.organizacao.id = :organizacaoId ORDER BY u.papel DESC, lower(u.nome), u.id")
    List<Usuario> equipe(@Param("organizacaoId") UUID organizacaoId);
}

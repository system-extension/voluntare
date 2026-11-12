package br.univille.voluntare.usuario.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.shared.exception.NaoAutenticadoException;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

/**
 * Carrega do banco quem fez a requisição (o id vem do token).
 * Reler a cada operação garante que conta ou organização desativada depois do login perca o acesso.
 */
@Service
@RequiredArgsConstructor
public class UsuarioLogadoService {

    private final UsuarioRepository usuarios;

    @Transactional(readOnly = true)
    public Usuario carregar(UUID id) {
        return usuarios.findComOrganizacaoById(id)
                .filter(Usuario::podeAcessar)
                .orElseThrow(() -> new NaoAutenticadoException("Sessão inválida. Faça login de novo."));
    }
}

package br.univille.voluntare.organizacao.service;

import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.repository.OportunidadeRepository;
import br.univille.voluntare.organizacao.dto.MembroEquipeResponse;
import br.univille.voluntare.organizacao.dto.NovoCoordenadorRequest;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.repository.UsuarioRepository;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import lombok.RequiredArgsConstructor;

/**
 * Equipe da organização (RN-14 e RN-15). Só o gestor mexe na equipe.
 * Pessoa de outra organização é tratada como inexistente, igual às vagas (RN-04).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EquipeService {

    private static final Set<StatusOportunidade> EM_ANDAMENTO =
            EnumSet.of(StatusOportunidade.RASCUNHO, StatusOportunidade.ABERTA);

    private final UsuarioRepository usuarios;
    private final OportunidadeRepository oportunidades;
    private final UsuarioLogadoService logado;
    private final PasswordEncoder senhas;

    @Transactional(readOnly = true)
    public List<MembroEquipeResponse> listar(UUID autorId) {
        Usuario gestor = gestor(autorId);
        UUID organizacaoId = gestor.getOrganizacao().getId();
        Map<UUID, Long> vagas = oportunidades.contarPorResponsavel(organizacaoId, EM_ANDAMENTO).stream()
                .collect(Collectors.toMap(l -> (UUID) l[0], l -> ((Number) l[1]).longValue()));
        return usuarios.equipe(organizacaoId).stream()
                .map(u -> MembroEquipeResponse.de(u, vagas.getOrDefault(u.getId(), 0L)))
                .toList();
    }

    public MembroEquipeResponse cadastrarCoordenador(UUID autorId, NovoCoordenadorRequest dados) {
        Usuario gestor = gestor(autorId);
        String email = dados.email().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("Já existe uma conta com esse e-mail.");
        }
        Usuario coordenador = usuarios.save(Usuario.coordenador(gestor.getOrganizacao(), dados.nome().trim(), email,
                senhas.encode(dados.senha())));
        return MembroEquipeResponse.de(coordenador, 0);
    }

    /** Passa as vagas em andamento para outra pessoa e desativa a conta, tudo na mesma transação. */
    public MembroEquipeResponse desativar(UUID autorId, UUID membroId, UUID novoResponsavelId) {
        Usuario gestor = gestor(autorId);
        Usuario membro = daEquipe(gestor, membroId);
        if (membro.getPapel() != Papel.COORDENADOR) {
            throw new ConflitoException("Só coordenadores podem ser desativados.");
        }
        if (!membro.isAtivo()) {
            throw new ConflitoException("Essa pessoa já está desativada.");
        }

        List<Oportunidade> vagas = oportunidades.findByResponsavelIdAndStatusIn(membro.getId(), EM_ANDAMENTO);
        if (!vagas.isEmpty()) {
            Usuario novo = novoResponsavel(gestor, membro, novoResponsavelId, vagas.size());
            vagas.forEach(v -> v.trocarResponsavel(novo));
        }
        membro.desativar();
        return MembroEquipeResponse.de(membro, 0);
    }

    private Usuario gestor(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        if (autor.getPapel() != Papel.GESTOR) {
            throw new AcessoNegadoException("Só o gestor da organização pode gerenciar a equipe.");
        }
        return autor;
    }

    private Usuario daEquipe(Usuario gestor, UUID membroId) {
        return usuarios.findById(membroId)
                .filter(u -> u.getOrganizacao() != null
                        && u.getOrganizacao().getId().equals(gestor.getOrganizacao().getId()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pessoa não encontrada na sua equipe."));
    }

    private Usuario novoResponsavel(Usuario gestor, Usuario membro, UUID novoResponsavelId, int quantidade) {
        String mensagem = "Escolha quem assume as " + quantidade + " vagas em andamento dessa pessoa.";
        if (novoResponsavelId == null || novoResponsavelId.equals(membro.getId())) {
            throw new DadosInvalidosException(List.of(new CampoErro("novoResponsavelId", mensagem)));
        }
        return usuarios.findById(novoResponsavelId)
                .filter(u -> u.getOrganizacao() != null
                        && u.getOrganizacao().getId().equals(gestor.getOrganizacao().getId())
                        && u.isAtivo())
                .orElseThrow(() -> new DadosInvalidosException(List.of(new CampoErro("novoResponsavelId",
                        "Escolha um gestor ou coordenador ativo da sua organização."))));
    }
}

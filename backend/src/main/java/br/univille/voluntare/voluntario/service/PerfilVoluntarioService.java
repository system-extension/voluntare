package br.univille.voluntare.voluntario.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import br.univille.voluntare.voluntario.dto.PerfilRequest;
import br.univille.voluntare.voluntario.dto.PerfilResponse;
import br.univille.voluntare.voluntario.entity.Habilidade;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;
import br.univille.voluntare.voluntario.repository.PerfilVoluntarioRepository;
import lombok.RequiredArgsConstructor;

/** O voluntário vê e edita o próprio perfil: contato, disponibilidade, habilidades e interesses (MVP do briefing). */
@Service
@RequiredArgsConstructor
@Transactional
public class PerfilVoluntarioService {

    private final PerfilVoluntarioRepository perfis;
    private final UsuarioLogadoService logado;
    private final CatalogoHabilidades catalogo;

    @Transactional(readOnly = true)
    public PerfilResponse meu(UUID autorId) {
        return PerfilResponse.de(carregar(autorId));
    }

    public PerfilResponse atualizar(UUID autorId, PerfilRequest dados) {
        PerfilVoluntario perfil = carregar(autorId);
        Set<Habilidade> sabeFazer = catalogo.buscar(dados.habilidadeIds(), "habilidadeIds");
        Set<Habilidade> querAprender = catalogo.buscar(dados.interesseIds(), "interesseIds");
        boolean repetida = sabeFazer.stream().anyMatch(querAprender::contains);
        if (repetida) {
            throw new DadosInvalidosException(List.of(new CampoErro("interesseIds",
                    "Uma habilidade não pode estar, ao mesmo tempo, entre as habilidades e os interesses.")));
        }

        perfil.getUsuario().renomear(dados.nome().trim());
        perfil.atualizarContato(limpo(dados.telefone()), limpo(dados.cidade()), limpo(dados.disponibilidade()));
        perfil.definirHabilidades(sabeFazer, querAprender);
        return PerfilResponse.de(perfil);
    }

    private PerfilVoluntario carregar(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        if (autor.getPapel() != Papel.VOLUNTARIO) {
            throw new AcessoNegadoException("Área exclusiva de voluntários.");
        }
        return perfis.findCompletoByUsuarioId(autor.getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil não encontrado."));
    }

    private static String limpo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}

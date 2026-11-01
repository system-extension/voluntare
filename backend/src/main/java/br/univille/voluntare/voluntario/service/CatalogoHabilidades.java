package br.univille.voluntare.voluntario.service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.voluntario.dto.HabilidadeResponse;
import br.univille.voluntare.voluntario.entity.Habilidade;
import br.univille.voluntare.voluntario.repository.HabilidadeRepository;
import lombok.RequiredArgsConstructor;

/** Catálogo de habilidades: listar e transformar os ids recebidos da tela em habilidades existentes. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoHabilidades {

    private final HabilidadeRepository habilidades;

    public List<HabilidadeResponse> listar() {
        return habilidades.findAllByOrderByNomeAsc().stream().map(HabilidadeResponse::de).toList();
    }

    /**
     * Ids repetidos contam uma vez; vazio ou nulo vira lista vazia.
     * Um id que não existe no catálogo responde 400 apontando o campo.
     */
    public Set<Habilidade> buscar(Collection<UUID> ids, String campo) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }
        Set<UUID> unicos = new LinkedHashSet<>(ids);
        List<Habilidade> encontradas = habilidades.findAllById(unicos);
        if (encontradas.size() != unicos.size()) {
            throw new DadosInvalidosException(List.of(new CampoErro(campo, "Escolha habilidades da lista.")));
        }
        return new LinkedHashSet<>(encontradas);
    }
}

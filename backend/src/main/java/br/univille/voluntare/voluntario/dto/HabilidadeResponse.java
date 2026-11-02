package br.univille.voluntare.voluntario.dto;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import br.univille.voluntare.voluntario.entity.Habilidade;

public record HabilidadeResponse(UUID id, String nome) {

    public static HabilidadeResponse de(Habilidade h) {
        return new HabilidadeResponse(h.getId(), h.getNome());
    }

    /** Em ordem alfabética, para a tela mostrar sempre igual. */
    public static List<HabilidadeResponse> lista(Collection<Habilidade> habilidades) {
        return habilidades.stream()
                .map(HabilidadeResponse::de)
                .sorted(Comparator.comparing(HabilidadeResponse::nome, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}

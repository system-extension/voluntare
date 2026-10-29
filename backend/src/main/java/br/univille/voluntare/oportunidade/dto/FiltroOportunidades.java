package br.univille.voluntare.oportunidade.dto;

import br.univille.voluntare.oportunidade.entity.Causa;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Parâmetros da busca pública (?texto=&local=&causa=&organizacaoId=&pagina=&tamanho=).
 * Todos opcionais. texto procura no título, na descrição, no nome da organização e na causa;
 * local procura no endereço, na cidade e na UF. Os dois ignoram acentos e maiúsculas.
 */
public record FiltroOportunidades(
        String texto,
        String local,
        Causa causa,
        Long organizacaoId,
        @Min(value = 1, message = "A página começa em 1.")
        Integer pagina,
        @Min(value = 1, message = "O tamanho da página vai de 1 a 50.")
        @Max(value = 50, message = "O tamanho da página vai de 1 a 50.")
        Integer tamanho) {

    public static final int TAMANHO_PADRAO = 15;

    public FiltroOportunidades {
        if (pagina == null) {
            pagina = 1;
        }
        if (tamanho == null) {
            tamanho = TAMANHO_PADRAO;
        }
    }
}

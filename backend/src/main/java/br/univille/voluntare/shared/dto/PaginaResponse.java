package br.univille.voluntare.shared.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/** Formato padrão das listas paginadas da API. A página começa em 1, como na URL do frontend. */
public record PaginaResponse<T>(List<T> itens, int pagina, int tamanho, long total, int totalPaginas) {

    public static <T> PaginaResponse<T> de(Page<T> page) {
        return new PaginaResponse<>(
                page.getContent(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                Math.max(1, page.getTotalPages()));
    }
}

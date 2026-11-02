package br.univille.voluntare.shared.exception;

import java.util.List;

/** Formato padrão de erro da API (docs/arquitetura.md). O frontend lê mensagem e campos. */
public record ErroResponse(int status, String mensagem, List<CampoErro> campos) {

    public record CampoErro(String campo, String mensagem) {
    }

    public static ErroResponse de(int status, String mensagem) {
        return new ErroResponse(status, mensagem, List.of());
    }
}

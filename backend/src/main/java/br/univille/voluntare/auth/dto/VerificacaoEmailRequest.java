package br.univille.voluntare.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Primeiro passo do acesso: só o e-mail. Vai no corpo (POST) para não aparecer em URL nem em log de acesso. */
public record VerificacaoEmailRequest(
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        String email) {

    /**
     * Tira os espaços das pontas antes da validação: o @Email recusa " ana@x.org " e o login aceita,
     * então sem isto os dois passos tratariam o mesmo e-mail de jeitos diferentes.
     * O Jackson monta o record por este construtor, e o @Valid confere o valor já limpo.
     */
    public VerificacaoEmailRequest {
        email = email == null ? null : email.strip();
    }
}

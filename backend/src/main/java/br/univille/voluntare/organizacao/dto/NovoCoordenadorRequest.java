package br.univille.voluntare.organizacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** O gestor define a senha inicial e repassa para o coordenador. */
public record NovoCoordenadorRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter até 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 160, message = "O e-mail pode ter até 160 caracteres.")
        String email,
        @NotBlank(message = "Informe a senha inicial.")
        @Size(min = 8, max = 72, message = "A senha precisa ter de 8 a 72 caracteres.")
        String senha) {
}

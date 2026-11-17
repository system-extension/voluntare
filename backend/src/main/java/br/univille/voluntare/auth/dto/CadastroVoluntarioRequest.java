package br.univille.voluntare.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Autocadastro do voluntário. Telefone e cidade são opcionais; o restante do perfil vem depois. */
public record CadastroVoluntarioRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter até 120 caracteres.")
        String nome,
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 160, message = "O e-mail pode ter até 160 caracteres.")
        String email,
        @NotBlank(message = "Informe a senha.")
        @Size(min = 8, max = 72, message = "A senha precisa ter de 8 a 72 caracteres.")
        String senha,
        @Size(max = 20, message = "O telefone pode ter até 20 caracteres.")
        String telefone,
        @Size(max = 100, message = "A cidade pode ter até 100 caracteres.")
        String cidade) {
}

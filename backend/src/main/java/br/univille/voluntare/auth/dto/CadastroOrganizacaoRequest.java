package br.univille.voluntare.auth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Autocadastro da ONG: a organização e o seu gestor nascem juntos (D-11). */
public record CadastroOrganizacaoRequest(
        @NotNull(message = "Informe os dados da organização.") @Valid DadosOrganizacao organizacao,
        @NotNull(message = "Informe os dados do gestor.") @Valid DadosGestor gestor) {

    public record DadosOrganizacao(
            @NotBlank(message = "Informe o nome da organização.")
            @Size(max = 150, message = "O nome pode ter até 150 caracteres.")
            String nome,
            @Size(max = 2000, message = "A descrição pode ter até 2000 caracteres.")
            String descricao,
            @NotBlank(message = "Informe a cidade.")
            @Size(max = 100, message = "A cidade pode ter até 100 caracteres.")
            String cidade,
            @NotBlank(message = "Informe o estado.")
            @Pattern(regexp = "[A-Z]{2}", message = "Informe a sigla do estado, como SC.")
            String uf,
            @NotBlank(message = "Informe o e-mail de contato.")
            @Email(message = "Informe um e-mail válido.")
            @Size(max = 160, message = "O e-mail pode ter até 160 caracteres.")
            String email,
            @Size(max = 20, message = "O telefone pode ter até 20 caracteres.")
            String telefone) {
    }

    public record DadosGestor(
            @NotBlank(message = "Informe o nome.")
            @Size(max = 120, message = "O nome pode ter até 120 caracteres.")
            String nome,
            @NotBlank(message = "Informe o e-mail.")
            @Email(message = "Informe um e-mail válido.")
            @Size(max = 160, message = "O e-mail pode ter até 160 caracteres.")
            String email,
            @NotBlank(message = "Informe a senha.")
            @Size(min = 8, max = 72, message = "A senha precisa ter de 8 a 72 caracteres.")
            String senha) {
    }
}

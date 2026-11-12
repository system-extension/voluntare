package br.univille.voluntare.voluntario.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Edição do perfil. As listas substituem as atuais: o que não vier deixa de fazer parte do perfil.
 * Uma habilidade não pode estar nas duas listas (RN-53).
 */
public record PerfilRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome pode ter até 120 caracteres.")
        String nome,
        @Size(max = 20, message = "O telefone pode ter até 20 caracteres.")
        String telefone,
        @Size(max = 100, message = "A cidade pode ter até 100 caracteres.")
        String cidade,
        @Size(max = 2000, message = "A disponibilidade pode ter até 2000 caracteres.")
        String disponibilidade,
        @Size(max = 20, message = "Escolha até 20 habilidades.")
        List<UUID> habilidadeIds,
        @Size(max = 20, message = "Escolha até 20 interesses.")
        List<UUID> interesseIds) {
}

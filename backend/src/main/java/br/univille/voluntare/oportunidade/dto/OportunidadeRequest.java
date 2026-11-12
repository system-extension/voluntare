package br.univille.voluntare.oportunidade.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import br.univille.voluntare.oportunidade.entity.Causa;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Dados para criar ou editar uma oportunidade.
 * Aqui só valida o formato de cada campo. Quais campos são obrigatórios depende do status
 * (rascunho aceita só o título) e é conferido na entidade, ao salvar.
 *
 * @param responsavelId gestor ou coordenador da organização. Na criação, vazio = quem está criando.
 * @param habilidadeIds habilidades desejadas, do catálogo. Na edição substituem as atuais (vazio = nenhuma).
 * @param rascunho      só na criação: true salva como RASCUNHO, false (padrão) já publica.
 */
public record OportunidadeRequest(
        @NotBlank(message = "Informe o título.")
        @Size(max = 150, message = "O título pode ter até 150 caracteres.")
        String titulo,
        @Size(max = 5000, message = "A descrição pode ter até 5000 caracteres.")
        String descricao,
        @Size(max = 5000, message = "As atividades podem ter até 5000 caracteres.")
        String atividades,
        @Size(max = 5000, message = "Os requisitos podem ter até 5000 caracteres.")
        String requisitos,
        Causa causa,
        @Size(max = 200, message = "O endereço pode ter até 200 caracteres.")
        String local,
        @Size(max = 100, message = "A cidade pode ter até 100 caracteres.")
        String cidade,
        @Pattern(regexp = "[A-Z]{2}", message = "Informe a sigla do estado, como SC.")
        String uf,
        Instant inicio,
        Instant fim,
        @Min(value = 1, message = "Informe de 1 a 999 vagas.")
        @Max(value = 999, message = "Informe de 1 a 999 vagas.")
        Integer vagas,
        UUID responsavelId,
        @Size(max = 10, message = "Escolha até 10 habilidades.")
        List<UUID> habilidadeIds,
        boolean rascunho) {
}

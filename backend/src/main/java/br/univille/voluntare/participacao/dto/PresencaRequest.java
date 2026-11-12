package br.univille.voluntare.participacao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Horas realizadas (regra 5: maiores que zero; o limite pela duração da atividade é conferido no service). */
public record PresencaRequest(
        @NotNull(message = "Informe as horas realizadas.")
        @DecimalMin(value = "0.01", message = "As horas precisam ser maiores que zero.")
        @Digits(integer = 3, fraction = 2, message = "Informe as horas com até duas casas decimais, como 3.5.")
        BigDecimal horas,
        @Size(max = 500, message = "A observação pode ter até 500 caracteres.")
        String observacao) {
}

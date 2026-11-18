package br.univille.voluntare.dashboard.dto;

import java.math.BigDecimal;

/**
 * Indicadores do painel da organização.
 * Em vagas, abertas e preenchidas não se repetem: abertas ainda têm lugar livre, preenchidas não.
 * escopo diz o que foi contado: ORGANIZACAO (gestor) ou MINHAS_VAGAS (coordenador).
 */
public record PainelResponse(String escopo, Vagas vagas, long candidaturasPendentes, Participacoes participacoes,
        BigDecimal horasRealizadas) {

    public record Vagas(long rascunhos, long abertas, long preenchidas, long encerradas, long canceladas) {
    }

    public record Participacoes(long confirmadas, long presentes, long ausentes, long canceladas,
            long canceladasTardias) {
    }
}

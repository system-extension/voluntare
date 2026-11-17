package br.univille.voluntare.oportunidade.dto;

import java.time.Instant;
import java.util.UUID;

import br.univille.voluntare.historico.entity.HistoricoStatus;

/** Uma linha da linha do tempo. statusAnterior nulo = criação. */
public record HistoricoResponse(String statusAnterior, String statusNovo, Instant alteradoEm,
        Pessoa alteradoPor, String observacao) {

    public record Pessoa(UUID id, String nome) {
    }

    public static HistoricoResponse de(HistoricoStatus linha) {
        return new HistoricoResponse(
                linha.getStatusAnterior(),
                linha.getStatusNovo(),
                linha.getAlteradoEm(),
                new Pessoa(linha.getAlteradoPor().getId(), linha.getAlteradoPor().getNome()),
                linha.getObservacao());
    }
}

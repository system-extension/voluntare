package br.univille.voluntare.participacao.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.participacao.entity.StatusParticipacao;

/**
 * Histórico de participações do voluntário (regra 7): continua aqui depois que a vaga é encerrada.
 * totalHoras soma só as participações com presença registrada.
 */
public record HistoricoVoluntarioResponse(BigDecimal totalHoras, long presencas, List<Item> participacoes) {

    public record Item(UUID id, StatusParticipacao status, BigDecimal horasRealizadas, Instant registradoEm,
            Instant canceladoEm, Atividade oportunidade) {
    }

    public record Atividade(UUID id, String titulo, String organizacao, String cidade, String uf, Instant inicio,
            Instant fim) {
    }

    public static HistoricoVoluntarioResponse de(List<Participacao> lista) {
        List<Participacao> presentes = lista.stream()
                .filter(p -> p.getStatus() == StatusParticipacao.PRESENTE)
                .toList();
        BigDecimal total = presentes.stream()
                .map(Participacao::getHorasRealizadas)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Item> itens = lista.stream().map(HistoricoVoluntarioResponse::item).toList();
        return new HistoricoVoluntarioResponse(total, presentes.size(), itens);
    }

    private static Item item(Participacao p) {
        Oportunidade o = p.getCandidatura().getOportunidade();
        Atividade atividade = new Atividade(o.getId(), o.getTitulo(), o.getOrganizacao().getNome(), o.getCidade(),
                o.getUf(), o.getInicio(), o.getFim());
        return new Item(p.getId(), p.getStatus(), p.getHorasRealizadas(), p.getRegistradoEm(), p.getCanceladoEm(),
                atividade);
    }
}

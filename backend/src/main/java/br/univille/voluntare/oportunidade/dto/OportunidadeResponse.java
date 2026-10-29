package br.univille.voluntare.oportunidade.dto;

import java.time.Instant;

import br.univille.voluntare.oportunidade.entity.Causa;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;

/** Oportunidade como a API devolve: organização resumida e vagas disponíveis já calculadas. */
public record OportunidadeResponse(
        Long id,
        String titulo,
        String descricao,
        String atividades,
        String requisitos,
        Causa causa,
        String local,
        String cidade,
        String uf,
        Instant inicio,
        Instant fim,
        Integer vagas,
        Integer vagasDisponiveis,
        StatusOportunidade status,
        Instant criadoEm,
        OrganizacaoResumo organizacao) {

    public record OrganizacaoResumo(Long id, String nome) {
    }

    /** @param vagasOcupadas participações que ocupam vaga (todas menos CANCELADA) */
    public static OportunidadeResponse de(Oportunidade o, long vagasOcupadas) {
        Integer disponiveis = o.getVagas() == null ? null : (int) Math.max(o.getVagas() - vagasOcupadas, 0);
        return new OportunidadeResponse(
                o.getId(),
                o.getTitulo(),
                o.getDescricao(),
                o.getAtividades(),
                o.getRequisitos(),
                o.getCausa(),
                o.getLocal(),
                o.getCidade(),
                o.getUf(),
                o.getInicio(),
                o.getFim(),
                o.getVagas(),
                disponiveis,
                o.getStatus(),
                o.getCriadoEm(),
                new OrganizacaoResumo(o.getOrganizacao().getId(), o.getOrganizacao().getNome()));
    }
}

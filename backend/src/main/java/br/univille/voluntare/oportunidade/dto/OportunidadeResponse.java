package br.univille.voluntare.oportunidade.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import br.univille.voluntare.oportunidade.entity.Causa;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.voluntario.dto.HabilidadeResponse;

/**
 * Oportunidade como a API devolve: organização e responsável resumidos e vagas disponíveis já calculadas.
 * Em rascunho, os campos do anúncio podem vir nulos.
 */
public record OportunidadeResponse(
        UUID id,
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
        OrganizacaoResumo organizacao,
        ResponsavelResumo responsavel,
        List<HabilidadeResponse> habilidades) {

    public record OrganizacaoResumo(UUID id, String nome) {
    }

    /** Quem responde pela vaga na organização: o contato para dúvidas. */
    public record ResponsavelResumo(UUID id, String nome) {
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
                new OrganizacaoResumo(o.getOrganizacao().getId(), o.getOrganizacao().getNome()),
                new ResponsavelResumo(o.getResponsavel().getId(), o.getResponsavel().getNome()),
                HabilidadeResponse.lista(o.getHabilidades()));
    }
}

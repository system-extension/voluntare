package br.univille.voluntare.dashboard.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.dashboard.dto.PainelResponse;
import br.univille.voluntare.dashboard.repository.PainelRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import lombok.RequiredArgsConstructor;

/** Gestor vê a organização inteira; coordenador, só as vagas pelas quais responde (RN-56). */
@Service
@RequiredArgsConstructor
public class PainelService {

    private final PainelRepository painel;
    private final UsuarioLogadoService logado;

    @Transactional(readOnly = true)
    public PainelResponse montar(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        if (autor.getOrganizacao() == null) {
            throw new AcessoNegadoException("Área exclusiva da equipe da organização.");
        }
        UUID organizacaoId = autor.getOrganizacao().getId();
        boolean todas = autor.getPapel() == Papel.GESTOR;

        Map<String, Long> vagas = new HashMap<>();
        for (Object[] linha : painel.vagasPorStatus(organizacaoId, todas, autor.getId())) {
            String chave = Boolean.TRUE.equals(linha[1]) ? "PREENCHIDA" : (String) linha[0];
            vagas.merge(chave, ((Number) linha[2]).longValue(), Long::sum);
        }

        Map<String, Long> participacoes = new HashMap<>();
        BigDecimal horas = BigDecimal.ZERO;
        for (Object[] linha : painel.participacoesPorStatus(organizacaoId, todas, autor.getId())) {
            participacoes.put((String) linha[0], ((Number) linha[1]).longValue());
            horas = horas.add(new BigDecimal(linha[2].toString()));
        }

        return new PainelResponse(
                todas ? "ORGANIZACAO" : "MINHAS_VAGAS",
                new PainelResponse.Vagas(
                        vagas.getOrDefault("RASCUNHO", 0L),
                        vagas.getOrDefault("ABERTA", 0L),
                        vagas.getOrDefault("PREENCHIDA", 0L),
                        vagas.getOrDefault("ENCERRADA", 0L),
                        vagas.getOrDefault("CANCELADA", 0L)),
                painel.candidaturasPendentes(organizacaoId, todas, autor.getId()),
                new PainelResponse.Participacoes(
                        participacoes.getOrDefault("CONFIRMADA", 0L),
                        participacoes.getOrDefault("PRESENTE", 0L),
                        participacoes.getOrDefault("AUSENTE", 0L),
                        participacoes.getOrDefault("CANCELADA", 0L),
                        participacoes.getOrDefault("CANCELADA_TARDIA", 0L)),
                horas);
    }
}

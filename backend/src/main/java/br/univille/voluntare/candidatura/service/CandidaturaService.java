package br.univille.voluntare.candidatura.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.candidatura.dto.CandidatoResponse;
import br.univille.voluntare.candidatura.dto.CandidaturaResponse;
import br.univille.voluntare.candidatura.entity.Candidatura;
import br.univille.voluntare.candidatura.entity.StatusCandidatura;
import br.univille.voluntare.candidatura.repository.CandidaturaRepository;
import br.univille.voluntare.historico.service.HistoricoService;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.repository.OportunidadeRepository;
import br.univille.voluntare.oportunidade.service.AcessoOportunidade;
import br.univille.voluntare.parametro.service.ParametroService;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.participacao.entity.StatusParticipacao;
import br.univille.voluntare.participacao.repository.ParticipacaoRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;
import br.univille.voluntare.voluntario.repository.PerfilVoluntarioRepository;
import lombok.RequiredArgsConstructor;

/**
 * Candidaturas (regras 1 a 4 e 6 do briefing):
 * - o voluntário se candidata uma vez por vaga aberta que ainda não começou;
 * - o responsável (ou o gestor) aceita ou rejeita; o aceite cria a participação e nunca passa das vagas;
 * - o voluntário desiste: antes do aceite cancela a candidatura; depois, a participação, e o prazo
 *   do parâmetro decide se a vaga volta.
 * Toda mudança de status grava o histórico na mesma transação.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CandidaturaService {

    private final CandidaturaRepository candidaturas;
    private final ParticipacaoRepository participacoes;
    private final OportunidadeRepository oportunidades;
    private final PerfilVoluntarioRepository perfis;
    private final UsuarioLogadoService logado;
    private final AcessoOportunidade acesso;
    private final HistoricoService historico;
    private final ParametroService parametros;

    // ---------- voluntário ----------

    public CandidaturaResponse candidatar(UUID autorId, UUID oportunidadeId) {
        Usuario autor = voluntario(autorId);
        PerfilVoluntario perfil = perfis.findById(autor.getId())
                .orElseThrow(() -> new AcessoNegadoException("Complete o seu perfil de voluntário para se candidatar."));
        Oportunidade oportunidade = oportunidades.findComRelacoesById(oportunidadeId)
                .filter(o -> o.getStatus() != StatusOportunidade.RASCUNHO)
                .orElseThrow(RecursoNaoEncontradoException::oportunidade);

        if (oportunidade.getStatus() != StatusOportunidade.ABERTA) {
            throw new ConflitoException("Esta oportunidade não está recebendo candidaturas.");
        }
        if (!oportunidade.getInicio().isAfter(Instant.now())) {
            throw new ConflitoException("Esta oportunidade já começou.");
        }
        // Regra 1. O índice único do banco garante o mesmo se duas requisições chegarem juntas.
        if (candidaturas.existsByOportunidadeIdAndVoluntarioUsuarioId(oportunidade.getId(), autor.getId())) {
            throw new ConflitoException("Você já se candidatou a esta oportunidade.");
        }

        Candidatura candidatura = candidaturas.save(Candidatura.nova(oportunidade, perfil));
        historico.registrarCandidatura(candidatura.getId(), null, StatusCandidatura.PENDENTE, autor, null);
        return CandidaturaResponse.de(candidatura, null);
    }

    @Transactional(readOnly = true)
    public List<CandidaturaResponse> minhas(UUID autorId) {
        Usuario autor = voluntario(autorId);
        List<Candidatura> lista = candidaturas.findByVoluntarioUsuarioIdOrderByCriadoEmDesc(autor.getId());
        Map<UUID, Participacao> participacaoPorCandidatura = participacoesDe(lista);
        return lista.stream()
                .map(c -> CandidaturaResponse.de(c, participacaoPorCandidatura.get(c.getId())))
                .toList();
    }

    public CandidaturaResponse desistir(UUID autorId, UUID candidaturaId) {
        Usuario autor = voluntario(autorId);
        Candidatura candidatura = candidaturas.findComRelacoesById(candidaturaId)
                .filter(c -> c.getVoluntario().getUsuarioId().equals(autor.getId()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."));

        if (candidatura.pendente()) {
            candidatura.cancelar();
            historico.registrarCandidatura(candidatura.getId(), StatusCandidatura.PENDENTE,
                    StatusCandidatura.CANCELADA, autor, null);
            return CandidaturaResponse.de(candidatura, null);
        }
        if (candidatura.getStatus() != StatusCandidatura.ACEITA) {
            throw new ConflitoException("Esta candidatura já foi encerrada.");
        }

        // Aceita: quem é cancelada é a participação
        Participacao participacao = participacoes.findByCandidaturaId(candidatura.getId())
                .filter(Participacao::confirmada)
                .orElseThrow(() -> new ConflitoException("Esta participação não pode mais ser cancelada."));
        Instant agora = Instant.now();
        Instant inicio = candidatura.getOportunidade().getInicio();
        if (!agora.isBefore(inicio)) {
            throw new ConflitoException("A atividade já começou. Fale com a organização.");
        }
        StatusParticipacao novo = participacao.cancelar(agora, inicio.minus(parametros.prazoDevolucaoVaga()));
        historico.registrarParticipacao(participacao.getId(), StatusParticipacao.CONFIRMADA, novo, autor, null);
        return CandidaturaResponse.de(candidatura, participacao);
    }

    // ---------- organização ----------

    @Transactional(readOnly = true)
    public List<CandidatoResponse> candidatos(UUID autorId, UUID oportunidadeId) {
        Oportunidade oportunidade = acesso.paraOperar(logado.carregar(autorId), oportunidadeId);
        List<Candidatura> lista = candidaturas.findByOportunidadeIdOrderByCriadoEmAsc(oportunidade.getId());
        Map<UUID, Participacao> participacaoPorCandidatura = participacoesDe(lista);
        return lista.stream()
                .map(c -> CandidatoResponse.de(c, participacaoPorCandidatura.get(c.getId())))
                .toList();
    }

    /**
     * Regra 3: confirmados nunca passam das vagas.
     * A ordem importa: primeiro trava a vaga (FOR UPDATE), só depois lê a candidatura e conta as vagas.
     * Assim, dois aceites ao mesmo tempo ficam em fila e o segundo já enxerga o que o primeiro gravou.
     */
    public CandidatoResponse aceitar(UUID autorId, UUID candidaturaId) {
        Usuario autor = logado.carregar(autorId);
        UUID oportunidadeId = candidaturas.idDaOportunidade(candidaturaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."));
        Oportunidade oportunidade = oportunidades.travar(oportunidadeId)
                .orElseThrow(RecursoNaoEncontradoException::oportunidade);
        acesso.exigirOperar(autor, oportunidade);
        exigirAberta(oportunidade);

        Candidatura candidatura = candidaturas.findComRelacoesById(candidaturaId).orElseThrow();
        exigirPendente(candidatura);
        long ocupadas = oportunidades.vagasOcupadas(List.of(oportunidade)).getOrDefault(oportunidade.getId(), 0L);
        if (ocupadas >= oportunidade.getVagas()) {
            throw new ConflitoException("As vagas desta oportunidade já foram preenchidas.");
        }

        candidatura.aceitar(autor);
        Participacao participacao = participacoes.save(Participacao.confirmar(candidatura));
        historico.registrarCandidatura(candidatura.getId(), StatusCandidatura.PENDENTE, StatusCandidatura.ACEITA,
                autor, null);
        historico.registrarParticipacao(participacao.getId(), null, StatusParticipacao.CONFIRMADA, autor, null);
        return CandidatoResponse.de(candidatura, participacao);
    }

    public CandidatoResponse rejeitar(UUID autorId, UUID candidaturaId, String motivo) {
        Usuario autor = logado.carregar(autorId);
        Candidatura candidatura = candidaturas.findComRelacoesById(candidaturaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."));
        acesso.exigirOperar(autor, candidatura.getOportunidade());
        exigirAberta(candidatura.getOportunidade());
        exigirPendente(candidatura);

        candidatura.rejeitar(autor);
        String observacao = motivo == null || motivo.isBlank() ? null : motivo.trim();
        historico.registrarCandidatura(candidatura.getId(), StatusCandidatura.PENDENTE,
                StatusCandidatura.REJEITADA, autor, observacao);
        return CandidatoResponse.de(candidatura, null);
    }

    // ---------- auxiliares ----------

    private Usuario voluntario(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        if (autor.getPapel() != Papel.VOLUNTARIO) {
            throw new AcessoNegadoException("Área exclusiva de voluntários.");
        }
        return autor;
    }

    private static void exigirAberta(Oportunidade oportunidade) {
        if (oportunidade.getStatus() != StatusOportunidade.ABERTA) {
            throw new ConflitoException("Só é possível decidir candidaturas de oportunidades abertas.");
        }
    }

    private static void exigirPendente(Candidatura candidatura) {
        if (!candidatura.pendente()) {
            throw new ConflitoException("Esta candidatura já foi decidida.");
        }
    }

    /** Uma consulta só para as participações da lista inteira (sem uma consulta por candidatura). */
    private Map<UUID, Participacao> participacoesDe(List<Candidatura> lista) {
        if (lista.isEmpty()) {
            return Map.of();
        }
        List<UUID> ids = lista.stream().map(Candidatura::getId).toList();
        return participacoes.findByCandidaturaIdIn(ids).stream()
                .collect(Collectors.toMap(p -> p.getCandidatura().getId(), Function.identity()));
    }
}

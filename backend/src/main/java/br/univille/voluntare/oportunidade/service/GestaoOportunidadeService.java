package br.univille.voluntare.oportunidade.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.historico.service.HistoricoService;
import br.univille.voluntare.oportunidade.dto.HistoricoResponse;
import br.univille.voluntare.oportunidade.dto.OportunidadeRequest;
import br.univille.voluntare.oportunidade.dto.OportunidadeResponse;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.repository.OportunidadeRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.DadosInvalidosException;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.repository.UsuarioRepository;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import lombok.RequiredArgsConstructor;

/**
 * Área da organização: o gestor cria vagas; o responsável pela vaga (ou o gestor) edita, publica,
 * encerra e cancela. Toda mudança de status grava o histórico na mesma transação.
 * Quem pode operar cada vaga está em AcessoOportunidade.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GestaoOportunidadeService {

    private final OportunidadeRepository oportunidades;
    private final UsuarioRepository usuarios;
    private final UsuarioLogadoService logado;
    private final HistoricoService historico;
    private final AcessoOportunidade acesso;

    // ---------- leitura ----------

    @Transactional(readOnly = true)
    public List<OportunidadeResponse> listar(UUID autorId) {
        Usuario autor = equipe(autorId);
        UUID organizacaoId = autor.getOrganizacao().getId();
        List<Oportunidade> lista = autor.getPapel() == Papel.GESTOR
                ? oportunidades.findByOrganizacaoIdOrderByCriadoEmDescIdDesc(organizacaoId)
                : oportunidades.findByOrganizacaoIdAndResponsavelIdOrderByCriadoEmDescIdDesc(organizacaoId,
                        autor.getId());
        Map<UUID, Long> ocupadas = oportunidades.vagasOcupadas(lista);
        return lista.stream()
                .map(o -> OportunidadeResponse.de(o, ocupadas.getOrDefault(o.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public OportunidadeResponse detalhar(UUID autorId, UUID id) {
        return resposta(paraOperar(equipe(autorId), id));
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponse> historico(UUID autorId, UUID id) {
        Oportunidade oportunidade = paraOperar(equipe(autorId), id);
        return historico.daOportunidade(oportunidade.getId()).stream().map(HistoricoResponse::de).toList();
    }

    // ---------- escrita ----------

    public OportunidadeResponse criar(UUID autorId, OportunidadeRequest dados) {
        Usuario autor = equipe(autorId);
        if (autor.getPapel() != Papel.GESTOR) {
            throw new AcessoNegadoException("Só o gestor da organização pode criar vagas.");
        }
        Usuario responsavel = dados.responsavelId() == null ? autor : responsavelValido(autor, dados.responsavelId());
        StatusOportunidade status = dados.rascunho() ? StatusOportunidade.RASCUNHO : StatusOportunidade.ABERTA;

        Oportunidade oportunidade = Oportunidade.nova(autor.getOrganizacao(), responsavel, status, dados);
        exigirSemPendencias(status == StatusOportunidade.ABERTA
                ? oportunidade.pendenciasParaAbrir(Instant.now(), true)
                : oportunidade.pendenciasDoPeriodo());

        oportunidades.save(oportunidade);
        historico.registrarOportunidade(oportunidade.getId(), null, status, autor, null);
        return resposta(oportunidade);
    }

    public OportunidadeResponse atualizar(UUID autorId, UUID id, OportunidadeRequest dados) {
        Usuario autor = equipe(autorId);
        Oportunidade oportunidade = paraOperar(autor, id);
        if (!oportunidade.editavel()) {
            throw new ConflitoException("Só rascunhos e oportunidades abertas podem ser editados.");
        }
        if (dados.responsavelId() != null && !dados.responsavelId().equals(oportunidade.getResponsavel().getId())) {
            if (autor.getPapel() != Papel.GESTOR) {
                throw new AcessoNegadoException("Só o gestor pode trocar o responsável pela vaga.");
            }
            oportunidade.trocarResponsavel(responsavelValido(autor, dados.responsavelId()));
        }

        // Contado antes de alterar a entidade: a consulta nativa faria o Hibernate gravar as mudanças antes da hora.
        long ocupadas = oportunidades.vagasOcupadas(List.of(oportunidade)).getOrDefault(id, 0L);
        Instant inicioAntes = oportunidade.getInicio();
        oportunidade.aplicar(dados);

        if (oportunidade.getStatus() == StatusOportunidade.ABERTA) {
            boolean inicioMudou = !Objects.equals(inicioAntes, oportunidade.getInicio());
            exigirSemPendencias(oportunidade.pendenciasParaAbrir(Instant.now(), inicioMudou));
            if (oportunidade.getVagas() < ocupadas) {
                throw new ConflitoException(
                        "As vagas não podem ficar abaixo dos " + ocupadas + " voluntários já confirmados.");
            }
        } else {
            exigirSemPendencias(oportunidade.pendenciasDoPeriodo());
        }
        return resposta(oportunidade);
    }

    public OportunidadeResponse publicar(UUID autorId, UUID id) {
        Usuario autor = equipe(autorId);
        Oportunidade oportunidade = paraOperar(autor, id);
        if (oportunidade.getStatus() != StatusOportunidade.RASCUNHO) {
            throw new ConflitoException("Só rascunhos podem ser publicados.");
        }
        exigirSemPendencias(oportunidade.pendenciasParaAbrir(Instant.now(), true));
        mudarStatus(oportunidade, StatusOportunidade.ABERTA, autor, null);
        return resposta(oportunidade);
    }

    public OportunidadeResponse encerrar(UUID autorId, UUID id) {
        Usuario autor = equipe(autorId);
        Oportunidade oportunidade = paraOperar(autor, id);
        if (oportunidade.getStatus() != StatusOportunidade.ABERTA) {
            throw new ConflitoException("Só oportunidades abertas podem ser encerradas.");
        }
        mudarStatus(oportunidade, StatusOportunidade.ENCERRADA, autor, null);
        return resposta(oportunidade);
    }

    /** Rascunho cancelado = descartado. Aberta cancelada sai da busca; participações ficam como estão. */
    public OportunidadeResponse cancelar(UUID autorId, UUID id, String motivo) {
        Usuario autor = equipe(autorId);
        Oportunidade oportunidade = paraOperar(autor, id);
        if (!oportunidade.editavel()) {
            throw new ConflitoException("Só rascunhos e oportunidades abertas podem ser cancelados.");
        }
        String observacao = motivo == null || motivo.isBlank() ? null : motivo.trim();
        mudarStatus(oportunidade, StatusOportunidade.CANCELADA, autor, observacao);
        return resposta(oportunidade);
    }

    // ---------- regras de acesso ----------

    private Usuario equipe(UUID autorId) {
        Usuario autor = logado.carregar(autorId);
        acesso.exigirEquipe(autor);
        return autor;
    }

    private Oportunidade paraOperar(Usuario autor, UUID id) {
        return acesso.paraOperar(autor, id);
    }

    /** Gestor ou coordenador ativo da mesma organização (a FK composta garante a organização no banco também). */
    private Usuario responsavelValido(Usuario autor, UUID responsavelId) {
        return usuarios.findById(responsavelId)
                .filter(u -> u.getOrganizacao() != null
                        && u.getOrganizacao().getId().equals(autor.getOrganizacao().getId())
                        && u.isAtivo())
                .orElseThrow(() -> new DadosInvalidosException(List.of(new CampoErro("responsavelId",
                        "Escolha um gestor ou coordenador ativo da sua organização."))));
    }

    // ---------- auxiliares ----------

    private void mudarStatus(Oportunidade oportunidade, StatusOportunidade novo, Usuario autor, String observacao) {
        StatusOportunidade anterior = oportunidade.getStatus();
        oportunidade.alterarStatus(novo);
        historico.registrarOportunidade(oportunidade.getId(), anterior, novo, autor, observacao);
    }

    private static void exigirSemPendencias(List<CampoErro> pendencias) {
        if (!pendencias.isEmpty()) {
            throw new DadosInvalidosException(pendencias);
        }
    }

    private OportunidadeResponse resposta(Oportunidade oportunidade) {
        long ocupadas = oportunidades.vagasOcupadas(List.of(oportunidade)).getOrDefault(oportunidade.getId(), 0L);
        return OportunidadeResponse.de(oportunidade, ocupadas);
    }
}

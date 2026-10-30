package br.univille.voluntare.oportunidade.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.oportunidade.dto.HistoricoResponse;
import br.univille.voluntare.oportunidade.dto.MotivoRequest;
import br.univille.voluntare.oportunidade.dto.OportunidadeRequest;
import br.univille.voluntare.oportunidade.dto.OportunidadeResponse;
import br.univille.voluntare.oportunidade.service.GestaoOportunidadeService;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Área da organização. Só gestor e coordenador entram (voluntário recebe 403).
 * O id de quem chama vem do token (sub); o service relê a pessoa no banco.
 */
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
@SecurityRequirement(name = OpenApiConfig.BEARER)
@Tag(name = "Área da organização")
public class GestaoOportunidadeController {

    private final GestaoOportunidadeService gestao;

    @GetMapping("/api/organizacao/oportunidades")
    @Operation(summary = "Vagas da organização em qualquer status. Coordenador vê só as que responde")
    public List<OportunidadeResponse> listar(@AuthenticationPrincipal Jwt token) {
        return gestao.listar(autor(token));
    }

    @GetMapping("/api/organizacao/oportunidades/{id}")
    @Operation(summary = "Detalhe para edição, inclusive rascunho")
    public OportunidadeResponse detalhar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return gestao.detalhar(autor(token), id);
    }

    @GetMapping("/api/organizacao/oportunidades/{id}/historico")
    @Operation(summary = "Linha do tempo dos status: quem criou e quem mudou o quê")
    public List<HistoricoResponse> historico(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return gestao.historico(autor(token), id);
    }

    @PostMapping("/api/oportunidades")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('GESTOR')")
    @Operation(summary = "Cria a vaga. rascunho=true salva só com o título; senão já publica")
    public OportunidadeResponse criar(@AuthenticationPrincipal Jwt token,
            @Valid @RequestBody OportunidadeRequest dados) {
        return gestao.criar(autor(token), dados);
    }

    @PutMapping("/api/oportunidades/{id}")
    @Operation(summary = "Edita rascunho ou vaga aberta. Trocar o responsável é só do gestor")
    public OportunidadeResponse atualizar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @Valid @RequestBody OportunidadeRequest dados) {
        return gestao.atualizar(autor(token), id, dados);
    }

    @PostMapping("/api/oportunidades/{id}/publicar")
    @Operation(summary = "Rascunho → aberta. Exige o anúncio completo")
    public OportunidadeResponse publicar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return gestao.publicar(autor(token), id);
    }

    @PostMapping("/api/oportunidades/{id}/encerrar")
    @Operation(summary = "Aberta → encerrada. Sai da busca")
    public OportunidadeResponse encerrar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return gestao.encerrar(autor(token), id);
    }

    @PostMapping("/api/oportunidades/{id}/cancelar")
    @Operation(summary = "Rascunho ou aberta → cancelada. Motivo opcional vai para o histórico")
    public OportunidadeResponse cancelar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @Valid @RequestBody(required = false) MotivoRequest corpo) {
        return gestao.cancelar(autor(token), id, corpo == null ? null : corpo.motivo());
    }

    private static UUID autor(Jwt token) {
        return UUID.fromString(token.getSubject());
    }
}

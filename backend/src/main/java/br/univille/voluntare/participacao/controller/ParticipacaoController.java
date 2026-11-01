package br.univille.voluntare.participacao.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.candidatura.dto.CandidatoResponse;
import br.univille.voluntare.oportunidade.dto.MotivoRequest;
import br.univille.voluntare.participacao.dto.HistoricoVoluntarioResponse;
import br.univille.voluntare.participacao.dto.PresencaRequest;
import br.univille.voluntare.participacao.service.ParticipacaoService;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER)
@Tag(name = "Participações")
public class ParticipacaoController {

    private final ParticipacaoService participacoes;

    @PostMapping("/api/participacoes/{id}/presenca")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Registrar presença e horas, depois do fim da atividade. Definitivo")
    public CandidatoResponse presenca(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @Valid @RequestBody PresencaRequest corpo) {
        return participacoes.registrarPresenca(autor(token), id, corpo.horas(), corpo.observacao());
    }

    @PostMapping("/api/participacoes/{id}/ausencia")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Registrar ausência, depois do fim da atividade. Observação opcional vai para o histórico")
    public CandidatoResponse ausencia(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @Valid @RequestBody(required = false) MotivoRequest corpo) {
        return participacoes.registrarAusencia(autor(token), id, corpo == null ? null : corpo.motivo());
    }

    @GetMapping("/api/participacoes/minhas")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Histórico de participações do voluntário, com o total de horas")
    public HistoricoVoluntarioResponse minhas(@AuthenticationPrincipal Jwt token) {
        return participacoes.historicoDoVoluntario(autor(token));
    }

    private static UUID autor(Jwt token) {
        return UUID.fromString(token.getSubject());
    }
}

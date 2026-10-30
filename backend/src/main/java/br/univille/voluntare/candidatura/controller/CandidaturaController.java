package br.univille.voluntare.candidatura.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.candidatura.dto.CandidatoResponse;
import br.univille.voluntare.candidatura.dto.CandidaturaResponse;
import br.univille.voluntare.candidatura.service.CandidaturaService;
import br.univille.voluntare.oportunidade.dto.MotivoRequest;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER)
@Tag(name = "Candidaturas")
public class CandidaturaController {

    private final CandidaturaService candidaturas;

    // ---------- voluntário ----------

    @PostMapping("/api/oportunidades/{id}/candidaturas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Candidatar-se a uma vaga aberta que ainda não começou")
    public CandidaturaResponse candidatar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return candidaturas.candidatar(autor(token), id);
    }

    @GetMapping("/api/candidaturas/minhas")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Minhas candidaturas, das mais recentes para as mais antigas")
    public List<CandidaturaResponse> minhas(@AuthenticationPrincipal Jwt token) {
        return candidaturas.minhas(autor(token));
    }

    @PostMapping("/api/candidaturas/{id}/cancelar")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Desistir. Pendente: cancela a candidatura. Aceita: cancela a participação (regra 6)")
    public CandidaturaResponse desistir(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return candidaturas.desistir(autor(token), id);
    }

    // ---------- organização ----------

    @GetMapping("/api/organizacao/oportunidades/{id}/candidaturas")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Candidatos da vaga, na ordem em que chegaram")
    public List<CandidatoResponse> candidatos(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return candidaturas.candidatos(autor(token), id);
    }

    @PostMapping("/api/candidaturas/{id}/aceitar")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Aceitar: cria a participação, se ainda houver vaga")
    public CandidatoResponse aceitar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id) {
        return candidaturas.aceitar(autor(token), id);
    }

    @PostMapping("/api/candidaturas/{id}/rejeitar")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Rejeitar. Motivo opcional vai para o histórico")
    public CandidatoResponse rejeitar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @Valid @RequestBody(required = false) MotivoRequest corpo) {
        return candidaturas.rejeitar(autor(token), id, corpo == null ? null : corpo.motivo());
    }

    private static UUID autor(Jwt token) {
        return UUID.fromString(token.getSubject());
    }
}

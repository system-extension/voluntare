package br.univille.voluntare.dashboard.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.dashboard.dto.PainelResponse;
import br.univille.voluntare.dashboard.service.PainelService;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Área da organização")
public class PainelController {

    private final PainelService painel;

    @GetMapping("/api/organizacao/painel")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Indicadores do painel. Gestor vê a organização; coordenador, só as vagas dele",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public PainelResponse painel(@AuthenticationPrincipal Jwt token) {
        return painel.montar(UUID.fromString(token.getSubject()));
    }
}

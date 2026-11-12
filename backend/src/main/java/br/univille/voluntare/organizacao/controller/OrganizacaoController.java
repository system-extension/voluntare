package br.univille.voluntare.organizacao.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.organizacao.dto.OrganizacaoResponse;
import br.univille.voluntare.shared.config.OpenApiConfig;
import br.univille.voluntare.usuario.service.UsuarioLogadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Área da organização")
public class OrganizacaoController {

    private final UsuarioLogadoService logado;

    @GetMapping("/api/organizacao")
    @PreAuthorize("hasAnyRole('GESTOR', 'COORDENADOR')")
    @Operation(summary = "Organização de quem está logado", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public OrganizacaoResponse minha(@AuthenticationPrincipal Jwt token) {
        // carregar() já traz a organização junto (EntityGraph), então não precisa de transação aqui
        return OrganizacaoResponse.de(logado.carregar(UUID.fromString(token.getSubject())).getOrganizacao());
    }
}

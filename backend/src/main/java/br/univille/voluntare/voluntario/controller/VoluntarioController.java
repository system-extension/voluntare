package br.univille.voluntare.voluntario.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.shared.config.OpenApiConfig;
import br.univille.voluntare.voluntario.dto.HabilidadeResponse;
import br.univille.voluntare.voluntario.dto.PerfilRequest;
import br.univille.voluntare.voluntario.dto.PerfilResponse;
import br.univille.voluntare.voluntario.service.CatalogoHabilidades;
import br.univille.voluntare.voluntario.service.PerfilVoluntarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Voluntário")
public class VoluntarioController {

    private final PerfilVoluntarioService perfis;
    private final CatalogoHabilidades catalogo;

    @GetMapping("/api/habilidades")
    @Operation(summary = "Catálogo de habilidades, em ordem alfabética. Público")
    public List<HabilidadeResponse> habilidades() {
        return catalogo.listar();
    }

    @GetMapping("/api/voluntarios/eu")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Meu perfil", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public PerfilResponse meuPerfil(@AuthenticationPrincipal Jwt token) {
        return perfis.meu(UUID.fromString(token.getSubject()));
    }

    @PutMapping("/api/voluntarios/eu")
    @PreAuthorize("hasRole('VOLUNTARIO')")
    @Operation(summary = "Editar meu perfil. As listas de habilidades e interesses substituem as atuais",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public PerfilResponse editarPerfil(@AuthenticationPrincipal Jwt token, @Valid @RequestBody PerfilRequest dados) {
        return perfis.atualizar(UUID.fromString(token.getSubject()), dados);
    }
}

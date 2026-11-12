package br.univille.voluntare.auth.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.auth.dto.CadastroOrganizacaoRequest;
import br.univille.voluntare.auth.dto.CadastroVoluntarioRequest;
import br.univille.voluntare.auth.dto.LoginRequest;
import br.univille.voluntare.auth.dto.SessaoResponse;
import br.univille.voluntare.auth.dto.UsuarioResponse;
import br.univille.voluntare.auth.service.AuthService;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService auth;

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Autocadastro do voluntário. Já devolve o token")
    public SessaoResponse cadastrarVoluntario(@Valid @RequestBody CadastroVoluntarioRequest dados) {
        return auth.cadastrarVoluntario(dados);
    }

    @PostMapping("/cadastro-organizacao")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Autocadastro da ONG com o seu gestor. Já devolve o token do gestor")
    public SessaoResponse cadastrarOrganizacao(@Valid @RequestBody CadastroOrganizacaoRequest dados) {
        return auth.cadastrarOrganizacao(dados);
    }

    @PostMapping("/login")
    @Operation(summary = "Entrar com e-mail e senha")
    public SessaoResponse entrar(@Valid @RequestBody LoginRequest dados) {
        return auth.entrar(dados);
    }

    @GetMapping("/eu")
    @Operation(summary = "Quem está logado", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public UsuarioResponse eu(@AuthenticationPrincipal Jwt token) {
        return auth.usuarioLogado(UUID.fromString(token.getSubject()));
    }
}

package br.univille.voluntare.organizacao.controller;

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

import br.univille.voluntare.organizacao.dto.DesativarMembroRequest;
import br.univille.voluntare.organizacao.dto.MembroEquipeResponse;
import br.univille.voluntare.organizacao.dto.NovoCoordenadorRequest;
import br.univille.voluntare.organizacao.service.EquipeService;
import br.univille.voluntare.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Equipe da organização. Só o gestor entra (coordenador e voluntário recebem 403). */
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('GESTOR')")
@SecurityRequirement(name = OpenApiConfig.BEARER)
@Tag(name = "Área da organização")
public class EquipeController {

    private final EquipeService equipe;

    @GetMapping("/api/organizacao/equipe")
    @Operation(summary = "Gestores e coordenadores da organização, ativos e desativados")
    public List<MembroEquipeResponse> listar(@AuthenticationPrincipal Jwt token) {
        return equipe.listar(autor(token));
    }

    @PostMapping("/api/organizacao/equipe")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um coordenador com a senha inicial definida pelo gestor")
    public MembroEquipeResponse cadastrar(@AuthenticationPrincipal Jwt token,
            @Valid @RequestBody NovoCoordenadorRequest dados) {
        return equipe.cadastrarCoordenador(autor(token), dados);
    }

    @PostMapping("/api/organizacao/equipe/{id}/desativar")
    @Operation(summary = "Desativa um coordenador. Se ele responde por vagas em andamento, informe quem assume")
    public MembroEquipeResponse desativar(@AuthenticationPrincipal Jwt token, @PathVariable UUID id,
            @RequestBody(required = false) DesativarMembroRequest corpo) {
        return equipe.desativar(autor(token), id, corpo == null ? null : corpo.novoResponsavelId());
    }

    private static UUID autor(Jwt token) {
        return UUID.fromString(token.getSubject());
    }
}

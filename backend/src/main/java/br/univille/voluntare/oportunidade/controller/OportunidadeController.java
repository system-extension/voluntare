package br.univille.voluntare.oportunidade.controller;

import java.util.UUID;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.univille.voluntare.oportunidade.dto.FiltroOportunidades;
import br.univille.voluntare.oportunidade.dto.OportunidadeResponse;
import br.univille.voluntare.oportunidade.service.ConsultaOportunidadeService;
import br.univille.voluntare.shared.dto.PaginaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/oportunidades")
@RequiredArgsConstructor
@Tag(name = "Oportunidades")
public class OportunidadeController {

    private final ConsultaOportunidadeService consulta;

    @GetMapping
    @Operation(summary = "Busca pública: só oportunidades abertas, das mais recentes para as mais antigas")
    public PaginaResponse<OportunidadeResponse> buscar(@Valid @ParameterObject FiltroOportunidades filtro) {
        return consulta.buscar(filtro);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe de uma oportunidade. Rascunho responde 404")
    public OportunidadeResponse detalhar(@PathVariable UUID id) {
        return consulta.detalhar(id);
    }
}

package br.univille.voluntare.oportunidade.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.oportunidade.dto.FiltroOportunidades;
import br.univille.voluntare.oportunidade.dto.OportunidadeResponse;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.oportunidade.repository.OportunidadeRepository;
import br.univille.voluntare.oportunidade.repository.OportunidadeSpecs;
import br.univille.voluntare.shared.dto.PaginaResponse;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;

/** Leitura pública das oportunidades: busca e detalhe. Não exige login. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultaOportunidadeService {

    // O id desempata anúncios criados no mesmo instante, para a paginação não repetir nem pular itens.
    private static final Sort MAIS_RECENTES = Sort.by(Sort.Order.desc("criadoEm"), Sort.Order.desc("id"));

    private final OportunidadeRepository repository;

    public PaginaResponse<OportunidadeResponse> buscar(FiltroOportunidades filtro) {
        PageRequest pageRequest = PageRequest.of(filtro.pagina() - 1, filtro.tamanho(), MAIS_RECENTES);
        Page<Oportunidade> pagina = repository.findAll(OportunidadeSpecs.buscaPublica(filtro), pageRequest);
        Map<UUID, Long> ocupadas = repository.vagasOcupadas(pagina.getContent());
        return PaginaResponse.de(pagina.map(o -> OportunidadeResponse.de(o, ocupadas.getOrDefault(o.getId(), 0L))));
    }

    /**
     * Detalhe de uma oportunidade. Encerradas e canceladas continuam visíveis (vagas salvas pelo voluntário);
     * rascunho é interno da organização e responde 404.
     */
    public OportunidadeResponse detalhar(UUID id) {
        Oportunidade oportunidade = repository.findByIdAndStatusNot(id, StatusOportunidade.RASCUNHO)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Oportunidade não encontrada."));
        long ocupadas = repository.vagasOcupadas(List.of(oportunidade)).getOrDefault(id, 0L);
        return OportunidadeResponse.de(oportunidade, ocupadas);
    }
}

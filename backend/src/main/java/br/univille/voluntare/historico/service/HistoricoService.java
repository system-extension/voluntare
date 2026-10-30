package br.univille.voluntare.historico.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.historico.entity.HistoricoStatus;
import br.univille.voluntare.historico.repository.HistoricoStatusRepository;
import br.univille.voluntare.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;

/**
 * Único ponto que grava em historico_status. Os services de oportunidade, candidatura e participação
 * chamam aqui na mesma transação da mudança: se a mudança falhar, o histórico também não fica.
 */
@Service
@RequiredArgsConstructor
public class HistoricoService {

    private final HistoricoStatusRepository repository;

    /** MANDATORY: chamar fora de uma transação é erro de programação, não um histórico solto. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void registrarOportunidade(UUID oportunidadeId, Enum<?> anterior, Enum<?> novo, Usuario autor,
            String observacao) {
        repository.save(HistoricoStatus.daOportunidade(
                oportunidadeId, anterior == null ? null : anterior.name(), novo.name(), autor, observacao));
    }

    @Transactional(readOnly = true)
    public List<HistoricoStatus> daOportunidade(UUID oportunidadeId) {
        return repository.findByOportunidadeIdOrderByAlteradoEmAscIdAsc(oportunidadeId);
    }
}

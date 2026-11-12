package br.univille.voluntare.parametro.service;

import java.time.Duration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.parametro.repository.ParametroRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParametroService {

    static final String PRAZO_DEVOLUCAO = "prazo_devolucao_vaga_horas";

    private final ParametroRepository parametros;

    /** Regra 6: até quanto tempo antes do início o cancelamento do voluntário devolve a vaga. */
    public Duration prazoDevolucaoVaga() {
        String horas = parametros.findById(PRAZO_DEVOLUCAO)
                .orElseThrow(() -> new IllegalStateException("Parâmetro ausente: " + PRAZO_DEVOLUCAO))
                .getValor();
        return Duration.ofHours(Long.parseLong(horas));
    }
}

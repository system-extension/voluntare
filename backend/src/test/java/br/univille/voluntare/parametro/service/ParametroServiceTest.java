package br.univille.voluntare.parametro.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.univille.voluntare.parametro.entity.Parametro;
import br.univille.voluntare.parametro.repository.ParametroRepository;

/** Leitura do prazo da regra 6 a partir da tabela parametro, com o repositório simulado. */
@ExtendWith(MockitoExtension.class)
class ParametroServiceTest {

    @Mock
    private ParametroRepository parametros;

    @InjectMocks
    private ParametroService service;

    @Test
    void prazoVemEmHorasDaTabelaParametro() {
        Parametro prazo = mock(Parametro.class);
        when(prazo.getValor()).thenReturn("48");
        when(parametros.findById(ParametroService.PRAZO_DEVOLUCAO)).thenReturn(Optional.of(prazo));

        assertThat(service.prazoDevolucaoVaga()).isEqualTo(Duration.ofHours(48));
    }

    @Test
    void parametroAusenteEhErroDeConfiguracao() {
        // Sem o parâmetro não há como decidir entre CANCELADA e CANCELADA_TARDIA: melhor falhar claro
        when(parametros.findById(ParametroService.PRAZO_DEVOLUCAO)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.prazoDevolucaoVaga())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("prazo_devolucao_vaga_horas");
    }
}

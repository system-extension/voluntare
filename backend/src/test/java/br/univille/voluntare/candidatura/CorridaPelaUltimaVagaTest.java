package br.univille.voluntare.candidatura;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

import br.univille.voluntare.Demo;
import br.univille.voluntare.TestcontainersConfiguration;
import br.univille.voluntare.candidatura.service.CandidaturaService;
import br.univille.voluntare.shared.exception.ConflitoException;

/**
 * Regra 3 sob concorrência: dois coordenadores clicam em "aceitar" ao mesmo tempo, para candidatos
 * diferentes, numa vaga que só tem um lugar. Exatamente um aceite pode passar.
 *
 * Este teste NÃO usa @Transactional: cada aceite precisa da sua própria transação, como em produção,
 * para um esperar o outro no SELECT ... FOR UPDATE. Por isso os dados ficam gravados de verdade, e o
 * @DirtiesContext descarta o banco no fim para não afetar os outros testes.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class CorridaPelaUltimaVagaTest {

    private static final String DIEGO = "diego@patasamigas.example.org";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private CandidaturaService candidaturas;

    @Test
    void doisAceitesAoMesmoTempoNaoPassamDaUltimaVaga() throws Exception {
        // Preparar: vaga com um único lugar e dois candidatos
        String vaga = criarVagaComUmLugar();
        UUID primeira = UUID.fromString(candidatar(cadastrarVoluntario("corrida1@example.com"), vaga));
        UUID segunda = UUID.fromString(candidatar(cadastrarVoluntario("corrida2@example.com"), vaga));
        UUID diego = UUID.fromString(Demo.usuario(4));

        // Agir: as duas threads esperam a largada e aceitam ao mesmo tempo
        ExecutorService threads = Executors.newFixedThreadPool(2);
        CountDownLatch largada = new CountDownLatch(1);
        Future<String> a = threads.submit(aceitar(diego, primeira, largada));
        Future<String> b = threads.submit(aceitar(diego, segunda, largada));
        largada.countDown();
        List<String> resultados = List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
        threads.shutdown();

        // Conferir: um passou, o outro encontrou a vaga preenchida
        assertThat(resultados).containsExactlyInAnyOrder("ACEITA", "SEM VAGA");
        mvc.perform(get("/api/oportunidades/" + vaga))
                .andExpect(jsonPath("$.vagasDisponiveis").value(0));
    }

    private Callable<String> aceitar(UUID autor, UUID candidatura, CountDownLatch largada) {
        return () -> {
            largada.await();
            try {
                candidaturas.aceitar(autor, candidatura);
                return "ACEITA";
            } catch (ConflitoException e) {
                return "SEM VAGA";
            }
        };
    }

    private String criarVagaComUmLugar() throws Exception {
        Instant inicio = Instant.now().plus(5, ChronoUnit.DAYS).truncatedTo(ChronoUnit.HOURS);
        String corpo = """
                {"titulo": "Vaga única", "descricao": "Só cabe uma pessoa nesta atividade.", "causa": "ANIMAIS",
                 "local": "Rua Vergueiro, 2100", "cidade": "São Paulo", "uf": "SP",
                 "inicio": "%s", "fim": "%s", "vagas": 1}
                """.formatted(inicio, inicio.plus(3, ChronoUnit.HOURS));
        return JsonPath.read(enviar(token(DIEGO), "/api/oportunidades", corpo), "$.id");
    }

    private String cadastrarVoluntario(String email) throws Exception {
        String corpo = """
                {"nome": "Voluntário da corrida", "email": "%s", "senha": "segredo123"}
                """.formatted(email);
        return JsonPath.read(enviar(null, "/api/auth/cadastro", corpo), "$.token");
    }

    private String candidatar(String token, String vaga) throws Exception {
        return JsonPath.read(enviar(token, "/api/oportunidades/" + vaga + "/candidaturas", ""), "$.id");
    }

    private String token(String email) throws Exception {
        String corpo = "{\"email\": \"%s\", \"senha\": \"%s\"}".formatted(email, Demo.SENHA);
        return JsonPath.read(enviar(null, "/api/auth/login", corpo), "$.token");
    }

    private String enviar(String token, String rota, String corpo) throws Exception {
        var requisicao = post(rota).contentType(MediaType.APPLICATION_JSON).content(corpo);
        if (token != null) {
            requisicao.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mvc.perform(requisicao).andReturn().getResponse().getContentAsString();
    }
}

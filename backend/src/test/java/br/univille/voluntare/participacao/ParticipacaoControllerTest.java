package br.univille.voluntare.participacao;

import static br.univille.voluntare.Demo.participacao;
import static br.univille.voluntare.Demo.vaga;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import br.univille.voluntare.Demo;
import br.univille.voluntare.TestcontainersConfiguration;
import jakarta.persistence.EntityManager;

/**
 * Presença, horas e histórico do voluntário contra a massa da V8.
 * Participação 1: Fernanda confirmada na vaga 1 (Bruno responde). A vaga 1 começa daqui a 10 dias;
 * os testes que precisam de uma atividade já terminada a puxam para ontem, com 4 horas de duração.
 * Participação 5: Fernanda presente na vaga 3 (4 h). Participação 8: Igor, cancelamento tardio.
 *
 * Como nos outros testes de API: dentro de cada teste, as chamadas que dão certo vêm antes das que falham.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class ParticipacaoControllerTest {

    private static final String BRUNO = "bruno@novoscaminhos.example.org";
    private static final String CARLA = "carla@novoscaminhos.example.org";
    private static final String DIEGO = "diego@patasamigas.example.org";
    private static final String FERNANDA = "fernanda@example.com";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    // ---------- presença e ausência ----------

    @Test
    void responsavelRegistraPresencaComHorasDepoisDoFim() throws Exception {
        vaga1JaAconteceu();
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/presenca").content("""
                {"horas": 3.5, "observacao": "Saiu meia hora antes"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voluntario.nome").value("Fernanda Lima"))
                .andExpect(jsonPath("$.participacao.status").value("PRESENTE"))
                .andExpect(jsonPath("$.participacao.horasRealizadas").value(3.5))
                .andExpect(jsonPath("$.participacao.registradoEm").isNotEmpty());

        em.flush(); // o histórico ainda está na memória do Hibernate; o JdbcTemplate lê direto do banco
        assertThat(jdbc.queryForObject("""
                SELECT observacao FROM historico_status WHERE participacao_id = ? AND status_novo = 'PRESENTE'
                """, String.class, Demo.uuid(participacao(1)))).isEqualTo("Saiu meia hora antes");
    }

    @Test
    void registraAusenciaSemHoras() throws Exception {
        vaga1JaAconteceu();
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/ausencia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participacao.status").value("AUSENTE"))
                .andExpect(jsonPath("$.participacao.horasRealizadas").doesNotExist());
    }

    @Test
    void naoRegistraAntesDoFimDaAtividade() throws Exception {
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/presenca").content("""
                {"horas": 2}
                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("A presença só pode ser registrada depois do fim da atividade."));
    }

    @Test
    void horasNaoPassamDaDuracao() throws Exception {
        vaga1JaAconteceu();
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/presenca").content("""
                {"horas": 5}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("horas"))
                .andExpect(jsonPath("$.campos[0].mensagem").value("As horas não podem passar da duração da atividade (4 h)."));
    }

    @Test
    void horasPrecisamSerMaioresQueZero() throws Exception {
        vaga1JaAconteceu();
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/presenca").content("""
                {"horas": 0}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("horas"));
    }

    @Test
    void registroEhDefinitivoESoParaConfirmada() throws Exception {
        // 5 já está PRESENTE; 8 é cancelamento tardio
        como(BRUNO, post("/api/participacoes/" + participacao(5) + "/ausencia"))
                .andExpect(status().isConflict());
        como(BRUNO, post("/api/participacoes/" + participacao(8) + "/presenca").content("""
                {"horas": 1}
                """))
                .andExpect(status().isConflict());
    }

    @Test
    void soOResponsavelOuOGestorRegistram() throws Exception {
        vaga1JaAconteceu();
        como(CARLA, post("/api/participacoes/" + participacao(1) + "/ausencia"))
                .andExpect(status().isForbidden());
        como(DIEGO, post("/api/participacoes/" + participacao(1) + "/ausencia"))
                .andExpect(status().isNotFound());
        como(FERNANDA, post("/api/participacoes/" + participacao(1) + "/ausencia"))
                .andExpect(status().isForbidden());
    }

    // ---------- histórico do voluntário ----------

    @Test
    void voluntarioVeOHistoricoComOTotalDeHoras() throws Exception {
        // Fernanda: vaga 1 e vaga 2 confirmadas, vaga 3 presente com 4 h
        como(FERNANDA, get("/api/participacoes/minhas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalHoras").value(4.0))
                .andExpect(jsonPath("$.presencas").value(1))
                .andExpect(jsonPath("$.participacoes.length()").value(3))
                // da atividade mais recente para a mais antiga: vaga 1 (+10 dias), vaga 2 (+5), vaga 3 (-20)
                .andExpect(jsonPath("$.participacoes[0].oportunidade.id").value(vaga(1)))
                .andExpect(jsonPath("$.participacoes[2].status").value("PRESENTE"))
                .andExpect(jsonPath("$.participacoes[2].oportunidade.organizacao").value("Instituto Novos Caminhos"));
    }

    @Test
    void historicoSomaAPresencaRecemRegistrada() throws Exception {
        vaga1JaAconteceu();
        como(BRUNO, post("/api/participacoes/" + participacao(1) + "/presenca").content("""
                {"horas": 3.5}
                """))
                .andExpect(status().isOk());
        como(FERNANDA, get("/api/participacoes/minhas"))
                .andExpect(jsonPath("$.totalHoras").value(7.5))
                .andExpect(jsonPath("$.presencas").value(2));
    }

    @Test
    void historicoEhSoDoVoluntario() throws Exception {
        como(BRUNO, get("/api/participacoes/minhas"))
                .andExpect(status().isForbidden());
    }

    // ---------- ajudantes ----------

    /** Puxa a vaga 1 para ontem, das 9h às 13h: a atividade já terminou e durou 4 horas. */
    private void vaga1JaAconteceu() {
        jdbc.update("""
                UPDATE oportunidade
                SET inicio = date_trunc('day', now()) - interval '1 day' + interval '9 hours',
                    fim    = date_trunc('day', now()) - interval '1 day' + interval '13 hours'
                WHERE id = ?
                """, Demo.uuid(vaga(1)));
    }

    private ResultActions como(String email, MockHttpServletRequestBuilder requisicao) throws Exception {
        String login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"%s\", \"senha\": \"%s\"}".formatted(email, Demo.SENHA)))
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(login, "$.token");
        return mvc.perform(requisicao
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON));
    }
}

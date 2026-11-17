package br.univille.voluntare.candidatura;

import static br.univille.voluntare.Demo.candidatura;
import static br.univille.voluntare.Demo.vaga;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
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
 * Candidaturas contra a massa da V8.
 * Vaga 1 (Bruno responde, 3 vagas, 1 ocupada): Fernanda aceita e confirmada (cand. 1), Gustavo pendente (2),
 * Helena rejeitada (3), Igor cancelou (4), Julia aceita mas desistiu a tempo (5).
 * Vaga 2 (Carla, 2 vagas, preenchida): Fernanda (6) e Lucas (7) confirmados, Gustavo pendente (8).
 * Vaga 8 (Patas Amigas, aberta, sem candidatos). Vaga 3 encerrada, vaga 4 rascunho.
 *
 * Como nos outros testes de API: dentro de cada teste, as chamadas que dão certo vêm antes das que falham.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class CandidaturaControllerTest {

    private static final String ANA = "ana@novoscaminhos.example.org";
    private static final String BRUNO = "bruno@novoscaminhos.example.org";
    private static final String CARLA = "carla@novoscaminhos.example.org";
    private static final String DIEGO = "diego@patasamigas.example.org";
    private static final String ELISA = "elisa@patasamigas.example.org";
    private static final String FERNANDA = "fernanda@example.com";
    private static final String GUSTAVO = "gustavo@example.com";
    private static final String HELENA = "helena@example.com";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    // ---------- candidatar ----------

    @Test
    void voluntarioSeCandidataEAOrganizacaoVeOCandidato() throws Exception {
        como(HELENA, post("/api/oportunidades/" + vaga(8) + "/candidaturas"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.oportunidade.titulo").value("Fotografia para feira de adoção"))
                .andExpect(jsonPath("$.participacao").doesNotExist());

        como(ELISA, get("/api/organizacao/oportunidades/" + vaga(8) + "/candidaturas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].voluntario.nome").value("Helena Rocha"))
                .andExpect(jsonPath("$[0].voluntario.email").value("helena@example.com"))
                .andExpect(jsonPath("$[0].status").value("PENDENTE"));
    }

    @Test
    void naoSeCandidataDuasVezes() throws Exception {
        como(FERNANDA, post("/api/oportunidades/" + vaga(1) + "/candidaturas"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Você já se candidatou a esta oportunidade."));
    }

    @Test
    void soSeCandidataAVagaAberta() throws Exception {
        como(HELENA, post("/api/oportunidades/" + vaga(3) + "/candidaturas"))
                .andExpect(status().isConflict());
        // Rascunho nem aparece para o voluntário
        como(HELENA, post("/api/oportunidades/" + vaga(4) + "/candidaturas"))
                .andExpect(status().isNotFound());
    }

    @Test
    void equipeDaOrganizacaoNaoSeCandidata() throws Exception {
        como(ANA, post("/api/oportunidades/" + vaga(8) + "/candidaturas"))
                .andExpect(status().isForbidden());
    }

    // ---------- aceitar e rejeitar ----------

    @Test
    void aceitarCriaAParticipacaoEOcupaUmaVaga() throws Exception {
        como(BRUNO, post("/api/candidaturas/" + candidatura(2) + "/aceitar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACEITA"))
                .andExpect(jsonPath("$.decididoEm").isNotEmpty())
                .andExpect(jsonPath("$.participacao.status").value("CONFIRMADA"));

        mvc.perform(get("/api/oportunidades/" + vaga(1)))
                .andExpect(jsonPath("$.vagasDisponiveis").value(1));
        // Histórico: criação pelo Gustavo (na V8) e aceite pelo Bruno
        String historico = jdbc.queryForObject("""
                SELECT string_agg(status_novo, ',' ORDER BY alterado_em) FROM historico_status WHERE candidatura_id = ?
                """, String.class, Demo.uuid(candidatura(2)));
        assertThat(historico).isEqualTo("PENDENTE,ACEITA");
    }

    @Test
    void naoAceitaQuandoAsVagasAcabaram() throws Exception {
        // Vaga 2: 2 de 2 ocupadas
        como(CARLA, post("/api/candidaturas/" + candidatura(8) + "/aceitar"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("As vagas desta oportunidade já foram preenchidas."));
    }

    @Test
    void rejeitarGuardaOMotivo() throws Exception {
        como(BRUNO, post("/api/candidaturas/" + candidatura(2) + "/rejeitar").content("""
                {"motivo": "Turma já fechada"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJEITADA"));
        em.flush(); // o histórico ainda está na memória do Hibernate; o JdbcTemplate lê direto do banco
        assertThat(jdbc.queryForObject("""
                SELECT observacao FROM historico_status WHERE candidatura_id = ? AND status_novo = 'REJEITADA'
                """, String.class, Demo.uuid(candidatura(2)))).isEqualTo("Turma já fechada");
    }

    @Test
    void naoDecideDuasVezes() throws Exception {
        // Candidatura 3 já foi rejeitada
        como(BRUNO, post("/api/candidaturas/" + candidatura(3) + "/aceitar"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Esta candidatura já foi decidida."));
    }

    @Test
    void soOResponsavelOuOGestorDecidem() throws Exception {
        como(CARLA, post("/api/candidaturas/" + candidatura(2) + "/aceitar"))
                .andExpect(status().isForbidden());
        como(DIEGO, post("/api/candidaturas/" + candidatura(2) + "/aceitar"))
                .andExpect(status().isNotFound());
        como(GUSTAVO, post("/api/candidaturas/" + candidatura(2) + "/aceitar"))
                .andExpect(status().isForbidden());
    }

    // ---------- desistir ----------

    @Test
    void desistirDeCandidaturaPendente() throws Exception {
        como(GUSTAVO, post("/api/candidaturas/" + candidatura(2) + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
    }

    @Test
    void desistirATempoDevolveAVaga() throws Exception {
        // Vaga 1 começa daqui a 10 dias: bem antes do prazo de 48 horas
        como(FERNANDA, post("/api/candidaturas/" + candidatura(1) + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACEITA"))
                .andExpect(jsonPath("$.participacao.status").value("CANCELADA"));
        mvc.perform(get("/api/oportunidades/" + vaga(1)))
                .andExpect(jsonPath("$.vagasDisponiveis").value(3));
    }

    @Test
    void desistirEmCimaDaHoraNaoDevolveAVaga() throws Exception {
        // Puxa a vaga 2 para começar daqui a 24 horas: dentro das 48 horas do prazo
        jdbc.update("UPDATE oportunidade SET inicio = now() + interval '24 hours', fim = now() + interval '27 hours'"
                + " WHERE id = ?", Demo.uuid(vaga(2)));
        como(FERNANDA, post("/api/candidaturas/" + candidatura(6) + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participacao.status").value("CANCELADA_TARDIA"));
        mvc.perform(get("/api/oportunidades/" + vaga(2)))
                .andExpect(jsonPath("$.vagasDisponiveis").value(0));
    }

    @Test
    void naoDesisteDaCandidaturaDosOutros() throws Exception {
        como(GUSTAVO, post("/api/candidaturas/" + candidatura(1) + "/cancelar"))
                .andExpect(status().isNotFound());
    }

    // ---------- listas ----------

    @Test
    void minhasCandidaturasMostramASituacaoDeCadaUma() throws Exception {
        // Fernanda: vaga 1 e vaga 2 confirmadas, vaga 3 com presença registrada
        como(FERNANDA, get("/api/candidaturas/minhas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].oportunidade.id").value(hasItem(vaga(3))))
                .andExpect(jsonPath("$[*].participacao.status").value(hasItem("PRESENTE")));
    }

    @Test
    void organizacaoVeOsCandidatosNaOrdemEmQueChegaram() throws Exception {
        como(BRUNO, get("/api/organizacao/oportunidades/" + vaga(1) + "/candidaturas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].voluntario.nome").value(contains(
                        "Fernanda Lima", "Helena Rocha", "Julia Ferreira", "Igor Santos", "Gustavo Alves")))
                .andExpect(jsonPath("$[2].participacao.status").value("CANCELADA"))
                .andExpect(jsonPath("$[0].voluntario.habilidades").value(contains("Educação ambiental", "Ensino e reforço escolar")))
                .andExpect(jsonPath("$[0].voluntario.interesses").value(contains("Recreação infantil")));
        como(CARLA, get("/api/organizacao/oportunidades/" + vaga(1) + "/candidaturas"))
                .andExpect(status().isForbidden());
    }

    // ---------- ajudante ----------

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

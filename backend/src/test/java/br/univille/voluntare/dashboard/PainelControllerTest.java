package br.univille.voluntare.dashboard;

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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import br.univille.voluntare.Demo;
import br.univille.voluntare.TestcontainersConfiguration;

/**
 * Painel da organização (RN-54 a RN-56) com os números da massa da V8.
 * Novos Caminhos: vaga 1 aberta com lugar (Bruno), 2 aberta e preenchida (Carla), 3 encerrada (Bruno),
 * 4 rascunho (Ana), 5 cancelada (Carla). Pendentes: uma na vaga 1 e uma na vaga 2.
 * Presenças só na vaga 3: 4h + 3,5h.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class PainelControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void gestorVeAOrganizacaoInteira() throws Exception {
        como("ana@novoscaminhos.example.org", get("/api/organizacao/painel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.escopo").value("ORGANIZACAO"))
                .andExpect(jsonPath("$.vagas.rascunhos").value(1))
                .andExpect(jsonPath("$.vagas.abertas").value(1))
                .andExpect(jsonPath("$.vagas.preenchidas").value(1))
                .andExpect(jsonPath("$.vagas.encerradas").value(1))
                .andExpect(jsonPath("$.vagas.canceladas").value(1))
                .andExpect(jsonPath("$.candidaturasPendentes").value(2))
                .andExpect(jsonPath("$.participacoes.confirmadas").value(3))
                .andExpect(jsonPath("$.participacoes.presentes").value(2))
                .andExpect(jsonPath("$.participacoes.ausentes").value(1))
                .andExpect(jsonPath("$.participacoes.canceladas").value(1))
                .andExpect(jsonPath("$.participacoes.canceladasTardias").value(1))
                .andExpect(jsonPath("$.horasRealizadas").value(7.5));
    }

    @Test
    void coordenadorVeSoAsVagasPelasQuaisResponde() throws Exception {
        como("bruno@novoscaminhos.example.org", get("/api/organizacao/painel"))
                .andExpect(jsonPath("$.escopo").value("MINHAS_VAGAS"))
                .andExpect(jsonPath("$.vagas.rascunhos").value(0))
                .andExpect(jsonPath("$.vagas.abertas").value(1))
                .andExpect(jsonPath("$.vagas.preenchidas").value(0))
                .andExpect(jsonPath("$.vagas.encerradas").value(1))
                .andExpect(jsonPath("$.candidaturasPendentes").value(1))
                .andExpect(jsonPath("$.participacoes.confirmadas").value(1))
                .andExpect(jsonPath("$.horasRealizadas").value(7.5));

        como("carla@novoscaminhos.example.org", get("/api/organizacao/painel"))
                .andExpect(jsonPath("$.vagas.abertas").value(0))
                .andExpect(jsonPath("$.vagas.preenchidas").value(1))
                .andExpect(jsonPath("$.vagas.canceladas").value(1))
                .andExpect(jsonPath("$.participacoes.confirmadas").value(2))
                .andExpect(jsonPath("$.participacoes.presentes").value(0))
                .andExpect(jsonPath("$.horasRealizadas").value(0));
    }

    @Test
    void cadaOrganizacaoVeSoOsSeusNumeros() throws Exception {
        como("diego@patasamigas.example.org", get("/api/organizacao/painel"))
                .andExpect(jsonPath("$.vagas.abertas").value(2))
                .andExpect(jsonPath("$.vagas.encerradas").value(1))
                .andExpect(jsonPath("$.vagas.rascunhos").value(0))
                .andExpect(jsonPath("$.candidaturasPendentes").value(1))
                .andExpect(jsonPath("$.participacoes.presentes").value(2))
                .andExpect(jsonPath("$.horasRealizadas").value(6.5));
    }

    @Test
    void painelEhSoDaEquipe() throws Exception {
        mvc.perform(get("/api/organizacao/painel")).andExpect(status().isUnauthorized());
        como("fernanda@example.com", get("/api/organizacao/painel")).andExpect(status().isForbidden());
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

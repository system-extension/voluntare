package br.univille.voluntare.voluntario;

import static br.univille.voluntare.Demo.habilidade;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
 * Perfil do voluntário e catálogo de habilidades, contra a massa da V8.
 * Fernanda: sabe "Ensino e reforço escolar" (1) e "Educação ambiental" (10); quer aprender "Recreação infantil" (2).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class VoluntarioControllerTest {

    private static final String FERNANDA = "fernanda@example.com";
    private static final String ANA = "ana@novoscaminhos.example.org";

    @Autowired
    private MockMvc mvc;

    @Test
    void catalogoEhPublicoEEmOrdemAlfabetica() throws Exception {
        mvc.perform(get("/api/habilidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(10))
                .andExpect(jsonPath("$[0].nome").value("Comunicação e redes sociais"));
    }

    @Test
    void voluntarioVeOProprioPerfil() throws Exception {
        como(FERNANDA, get("/api/voluntarios/eu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Fernanda Lima"))
                .andExpect(jsonPath("$.cidade").value("Joinville"))
                .andExpect(jsonPath("$.disponibilidade").value("Fins de semana e terças à tarde"))
                .andExpect(jsonPath("$.habilidades[*].nome").value(contains("Educação ambiental", "Ensino e reforço escolar")))
                .andExpect(jsonPath("$.interesses[*].nome").value(contains("Recreação infantil")));
    }

    @Test
    void editarTrocaContatoHabilidadesEInteresses() throws Exception {
        // "Ensino e reforço escolar" passa de habilidade para interesse; "Fotografia" entra; as demais saem
        como(FERNANDA, put("/api/voluntarios/eu").content("""
                {"nome": "Fernanda Lima Souza", "telefone": "(47) 98888-1111", "cidade": "Araquari",
                 "disponibilidade": "Sábados de manhã",
                 "habilidadeIds": ["%s"], "interesseIds": ["%s"]}
                """.formatted(habilidade(5), habilidade(1))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Fernanda Lima Souza"))
                .andExpect(jsonPath("$.cidade").value("Araquari"))
                .andExpect(jsonPath("$.habilidades[*].nome").value(contains("Fotografia")))
                .andExpect(jsonPath("$.interesses[*].nome").value(contains("Ensino e reforço escolar")));

        como(FERNANDA, get("/api/voluntarios/eu"))
                .andExpect(jsonPath("$.disponibilidade").value("Sábados de manhã"))
                .andExpect(jsonPath("$.habilidades.length()").value(1));
    }

    @Test
    void mesmaHabilidadeNaoPodeSerHabilidadeEInteresse() throws Exception {
        como(FERNANDA, put("/api/voluntarios/eu").content("""
                {"nome": "Fernanda Lima", "habilidadeIds": ["%s"], "interesseIds": ["%s"]}
                """.formatted(habilidade(5), habilidade(5))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("interesseIds"));
    }

    @Test
    void habilidadeForaDoCatalogoEhRecusada() throws Exception {
        como(FERNANDA, put("/api/voluntarios/eu").content("""
                {"nome": "Fernanda Lima", "habilidadeIds": ["%s"]}
                """.formatted(habilidade(99))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("habilidadeIds"));
    }

    @Test
    void perfilEhSoDoVoluntario() throws Exception {
        como(ANA, get("/api/voluntarios/eu"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/voluntarios/eu"))
                .andExpect(status().isUnauthorized());
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

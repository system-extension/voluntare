package br.univille.voluntare.organizacao;

import static br.univille.voluntare.Demo.organizacao;
import static br.univille.voluntare.Demo.usuario;
import static br.univille.voluntare.Demo.vaga;
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
 * Equipe da organização (RN-14 e RN-15) contra a massa da V8.
 * Instituto Novos Caminhos: Ana gestora (usuário 1), Bruno (2) responde pela vaga 1 (aberta) e 3 (encerrada),
 * Carla (3) pela 2 (aberta) e 5 (cancelada), Ana pela 4 (rascunho). Diego (4) é gestor da Patas Amigas.
 * Como nos outros testes de integração, as chamadas que dão certo vêm antes das que falham.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class EquipeControllerTest {

    private static final String ANA = "ana@novoscaminhos.example.org";
    private static final String BRUNO = "bruno@novoscaminhos.example.org";
    private static final String FERNANDA = "fernanda@example.com";

    @Autowired
    private MockMvc mvc;

    @Test
    void gestorVeAEquipeComAsVagasEmAndamentoDeCadaUm() throws Exception {
        como(ANA, get("/api/organizacao/equipe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nome").value("Ana Ribeiro"))
                .andExpect(jsonPath("$[0].papel").value("GESTOR"))
                .andExpect(jsonPath("$[0].vagasEmAndamento").value(1))
                .andExpect(jsonPath("$[1].nome").value("Bruno Costa"))
                .andExpect(jsonPath("$[1].papel").value("COORDENADOR"))
                .andExpect(jsonPath("$[1].ativo").value(true))
                .andExpect(jsonPath("$[1].vagasEmAndamento").value(1))
                .andExpect(jsonPath("$[2].nome").value("Carla Mendes"));
    }

    @Test
    void gestorCadastraCoordenadorQueJaConsegueEntrar() throws Exception {
        como(ANA, post("/api/organizacao/equipe").content("""
                {"nome": "Paulo Reis", "email": "Paulo@NovosCaminhos.example.org", "senha": "inicial123"}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.papel").value("COORDENADOR"))
                .andExpect(jsonPath("$.email").value("paulo@novoscaminhos.example.org"))
                .andExpect(jsonPath("$.ativo").value(true));

        login("paulo@novoscaminhos.example.org", "inicial123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.papel").value("COORDENADOR"))
                .andExpect(jsonPath("$.usuario.organizacao.id").value(organizacao(1)));

        como(ANA, post("/api/organizacao/equipe").content("""
                {"nome": "Outra Pessoa", "email": "fernanda@example.com", "senha": "inicial123"}
                """))
                .andExpect(status().isConflict());
    }

    @Test
    void cadastroDoCoordenadorValidaOsCampos() throws Exception {
        como(ANA, post("/api/organizacao/equipe").content("""
                {"nome": "", "email": "sem-arroba", "senha": "curta"}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.length()").value(3));
    }

    @Test
    void desativarPassaAsVagasParaQuemAssumeEAContaPerdeOAcesso() throws Exception {
        como(ANA, post("/api/organizacao/equipe/" + usuario(2) + "/desativar").content("""
                {"novoResponsavelId": "%s"}
                """.formatted(usuario(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));

        como(ANA, get("/api/organizacao/oportunidades/" + vaga(1)))
                .andExpect(jsonPath("$.responsavel.id").value(usuario(3)));
        // vaga encerrada não muda de responsável: o histórico continua mostrando quem cuidou dela
        como(ANA, get("/api/organizacao/oportunidades/" + vaga(3)))
                .andExpect(jsonPath("$.responsavel.id").value(usuario(2)));

        login(BRUNO, Demo.SENHA).andExpect(status().isForbidden());
    }

    @Test
    void desativarSemVagasEmAndamentoNaoPedeNovoResponsavel() throws Exception {
        String resposta = como(ANA, post("/api/organizacao/equipe").content("""
                {"nome": "Paulo Reis", "email": "paulo@novoscaminhos.example.org", "senha": "inicial123"}
                """))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(resposta, "$.id");

        como(ANA, post("/api/organizacao/equipe/" + id + "/desativar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));

        como(ANA, post("/api/organizacao/equipe/" + id + "/desativar"))
                .andExpect(status().isConflict());
    }

    @Test
    void quemTemVagasEmAndamentoPrecisaDeAlguemParaAssumir() throws Exception {
        como(ANA, post("/api/organizacao/equipe/" + usuario(2) + "/desativar"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("novoResponsavelId"));
    }

    @Test
    void novoResponsavelPrecisaSerDaMesmaOrganizacaoEAtivo() throws Exception {
        como(ANA, post("/api/organizacao/equipe/" + usuario(2) + "/desativar").content("""
                {"novoResponsavelId": "%s"}
                """.formatted(usuario(4))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("novoResponsavelId"));
    }

    @Test
    void gestorNaoEhDesativadoENemAlguemDeOutraOrganizacao() throws Exception {
        como(ANA, post("/api/organizacao/equipe/" + usuario(1) + "/desativar"))
                .andExpect(status().isConflict());
        como(ANA, post("/api/organizacao/equipe/" + usuario(5) + "/desativar"))
                .andExpect(status().isNotFound());
    }

    @Test
    void soOGestorMexeNaEquipe() throws Exception {
        mvc.perform(get("/api/organizacao/equipe")).andExpect(status().isUnauthorized());
        como(BRUNO, get("/api/organizacao/equipe")).andExpect(status().isForbidden());
        como(FERNANDA, get("/api/organizacao/equipe")).andExpect(status().isForbidden());
        como(BRUNO, post("/api/organizacao/equipe/" + usuario(3) + "/desativar")).andExpect(status().isForbidden());
    }

    private ResultActions login(String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\": \"%s\", \"senha\": \"%s\"}".formatted(email, senha)));
    }

    /** Faz a requisição já logado como a pessoa (senha da massa: Voluntare@2026). */
    private ResultActions como(String email, MockHttpServletRequestBuilder requisicao) throws Exception {
        String token = JsonPath.read(login(email, Demo.SENHA).andReturn().getResponse().getContentAsString(), "$.token");
        return mvc.perform(requisicao
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON));
    }
}

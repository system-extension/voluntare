package br.univille.voluntare.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

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
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import br.univille.voluntare.TestcontainersConfiguration;
import jakarta.persistence.EntityManager;

/**
 * Cadastro, login e rota protegida. Usa a massa da V8 (senha de todos: Voluntare@2026).
 * Cada teste roda numa transação desfeita no fim: os cadastros não vazam para os outros testes.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class AuthControllerTest {

    private static final String SENHA_DEMO = "Voluntare@2026";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager em;

    // ---------- login ----------

    @Test
    void gestorEntraERecebeTokenComOsDadosDaOrganizacao() throws Exception {
        login("ana@novoscaminhos.example.org", SENHA_DEMO)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiraEm").isNotEmpty())
                .andExpect(jsonPath("$.usuario.nome").value("Ana Ribeiro"))
                .andExpect(jsonPath("$.usuario.papel").value("GESTOR"))
                .andExpect(jsonPath("$.usuario.organizacao.nome").value("Instituto Novos Caminhos"));
    }

    @Test
    void emailNaoDiferenciaMaiusculas() throws Exception {
        login("  FERNANDA@Example.com ", SENHA_DEMO)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.papel").value("VOLUNTARIO"))
                .andExpect(jsonPath("$.usuario.organizacao").value(nullValue()));
    }

    @Test
    void senhaErradaEEmailInexistenteTemAMesmaResposta() throws Exception {
        login("ana@novoscaminhos.example.org", "senha-errada")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("E-mail ou senha inválidos."));
        login("ninguem@example.com", SENHA_DEMO)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("E-mail ou senha inválidos."));
    }

    @Test
    void contaDesativadaNaoEntra() throws Exception {
        // Marcos (id 12) é o coordenador inativo da massa
        login("marcos@patasamigas.example.org", SENHA_DEMO)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    // ---------- cadastro do voluntário ----------

    @Test
    void cadastraVoluntarioComPerfilEJaDevolveASessao() throws Exception {
        String corpo = """
                {"nome": "Paula Nunes", "email": "Paula@Example.com", "senha": "segredo123",
                 "telefone": "(47) 98888-0000", "cidade": "Joinville"}
                """;
        String resposta = enviar("/api/auth/cadastro", corpo)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.email").value("paula@example.com"))
                .andExpect(jsonPath("$.usuario.papel").value("VOLUNTARIO"))
                .andReturn().getResponse().getContentAsString();

        String id = JsonPath.read(resposta, "$.usuario.id");
        // O perfil ainda está só na memória do Hibernate (o INSERT sai no commit, que aqui não acontece).
        // O JdbcTemplate lê direto do banco e não dispara esse envio sozinho: forçamos com flush().
        em.flush();
        assertThat(jdbc.queryForObject(
                "SELECT cidade FROM perfil_voluntario WHERE usuario_id = ?", String.class, UUID.fromString(id)))
                .isEqualTo("Joinville");
        login("paula@example.com", "segredo123").andExpect(status().isOk());
    }

    @Test
    void recusaEmailJaCadastrado() throws Exception {
        String corpo = """
                {"nome": "Outra Fernanda", "email": "FERNANDA@example.com", "senha": "segredo123"}
                """;
        enviar("/api/auth/cadastro", corpo)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Já existe uma conta com esse e-mail."));
    }

    @Test
    void recusaCadastroInvalidoApontandoOsCampos() throws Exception {
        String corpo = """
                {"nome": "", "email": "nao-e-email", "senha": "123"}
                """;
        enviar("/api/auth/cadastro", corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[*].campo").value(containsInAnyOrder("nome", "email", "senha")));
    }

    @Test
    void recusaJsonMalformado() throws Exception {
        enviar("/api/auth/cadastro", "{ isso não é json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Corpo da requisição inválido."));
    }

    // ---------- cadastro da organização ----------

    @Test
    void cadastraOrganizacaoComOGestorNaMesmaTransacao() throws Exception {
        String corpo = """
                {"organizacao": {"nome": "Rede Bairro Vivo", "cidade": "Joinville", "uf": "SC",
                                 "email": "contato@bairrovivo.example.org"},
                 "gestor": {"nome": "Rita Prado", "email": "rita@bairrovivo.example.org", "senha": "segredo123"}}
                """;
        enviar("/api/auth/cadastro-organizacao", corpo)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.papel").value("GESTOR"))
                .andExpect(jsonPath("$.usuario.organizacao.nome").value("Rede Bairro Vivo"));
    }

    @Test
    void recusaOrganizacaoComNomeRepetidoSemGravarNada() throws Exception {
        String corpo = """
                {"organizacao": {"nome": "instituto novos caminhos", "cidade": "Joinville", "uf": "SC",
                                 "email": "outro@example.org"},
                 "gestor": {"nome": "Teste", "email": "novo.gestor@example.org", "senha": "segredo123"}}
                """;
        enviar("/api/auth/cadastro-organizacao", corpo)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensagem").value("Já existe uma organização com esse nome."));
        assertThat(jdbc.queryForObject(
                "SELECT count(*) FROM usuario WHERE email = 'novo.gestor@example.org'", Integer.class))
                .isZero();
    }

    @Test
    void validaOsCamposAninhadosDaOrganizacao() throws Exception {
        String corpo = """
                {"organizacao": {"nome": "ONG X", "cidade": "Joinville", "uf": "sc", "email": "x@example.org"},
                 "gestor": {"nome": "Teste", "email": "teste@example.org", "senha": "curta"}}
                """;
        enviar("/api/auth/cadastro-organizacao", corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[*].campo")
                        .value(containsInAnyOrder("organizacao.uf", "gestor.senha")));
    }

    // ---------- rota protegida ----------

    @Test
    void euDevolveQuemEstaLogado() throws Exception {
        String token = tokenDe("bruno@novoscaminhos.example.org");
        mvc.perform(get("/api/auth/eu").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Bruno Costa"))
                .andExpect(jsonPath("$.papel").value("COORDENADOR"));
    }

    @Test
    void semTokenOuComTokenInvalidoResponde401NoFormatoPadrao() throws Exception {
        mvc.perform(get("/api/auth/eu"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.mensagem").value("Faça login para continuar."));
        mvc.perform(get("/api/auth/eu").header(HttpHeaders.AUTHORIZATION, "Bearer token-falso"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void contaDesativadaDepoisDoLoginPerdeOAcesso() throws Exception {
        String token = tokenDe("carla@novoscaminhos.example.org");
        jdbc.update("UPDATE usuario SET ativo = FALSE WHERE email = 'carla@novoscaminhos.example.org'");
        em.clear(); // o login deixou a Carla em memória (mesma transação do teste); força reler do banco
        mvc.perform(get("/api/auth/eu").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void buscaPublicaContinuaSemLogin() throws Exception {
        mvc.perform(get("/api/oportunidades")).andExpect(status().isOk());
    }

    // ---------- ajudantes ----------

    private ResultActions login(String email, String senha) throws Exception {
        return enviar("/api/auth/login", """
                {"email": "%s", "senha": "%s"}
                """.formatted(email, senha));
    }

    private ResultActions enviar(String rota, String json) throws Exception {
        return mvc.perform(post(rota).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private String tokenDe(String email) throws Exception {
        String resposta = login(email, SENHA_DEMO).andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }
}

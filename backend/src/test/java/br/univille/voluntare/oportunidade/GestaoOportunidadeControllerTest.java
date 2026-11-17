package br.univille.voluntare.oportunidade;

import static br.univille.voluntare.Demo.habilidade;
import static br.univille.voluntare.Demo.organizacao;
import static br.univille.voluntare.Demo.usuario;
import static br.univille.voluntare.Demo.vaga;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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
 * Área da organização contra a massa da V8.
 * Instituto Novos Caminhos (org 1): Ana é gestora (usuário 1); Bruno (2) responde pelas vagas 1 e 3;
 * Carla (3) pelas vagas 2 e 5; Ana pela 4 (rascunho). A vaga 2 tem as 2 vagas ocupadas.
 * Patas Amigas (org 2): Diego é gestor (4). Fernanda (6) é voluntária.
 *
 * Cuidado ao escrever um teste novo: o teste inteiro é uma transação só. Quando o service lança um erro
 * (400, 403, 404, 409), o Spring marca essa transação para desfazer, e o que vier depois dentro do mesmo
 * teste pode não ser gravado. Por isso, em cada teste, as chamadas que dão certo vêm antes das que falham.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class GestaoOportunidadeControllerTest {

    private static final String ANA = "ana@novoscaminhos.example.org";
    private static final String BRUNO = "bruno@novoscaminhos.example.org";
    private static final String CARLA = "carla@novoscaminhos.example.org";
    private static final String DIEGO = "diego@patasamigas.example.org";
    private static final String FERNANDA = "fernanda@example.com";

    @Autowired
    private MockMvc mvc;

    // ---------- criar ----------

    @Test
    void gestorCriaVagaAbertaQueApareceNaBuscaComHistoricoDeCriacao() throws Exception {
        String resposta = como(ANA, post("/api/oportunidades").content(vagaCompleta("Mutirão de leitura", null)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ABERTA"))
                .andExpect(jsonPath("$.vagasDisponiveis").value(5))
                .andExpect(jsonPath("$.responsavel.nome").value("Ana Ribeiro"))
                .andExpect(jsonPath("$.organizacao.id").value(organizacao(1)))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(resposta, "$.id");

        mvc.perform(get("/api/oportunidades").param("texto", "mutirao de leitura"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(id)));

        como(ANA, get("/api/organizacao/oportunidades/" + id + "/historico"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].statusAnterior").doesNotExist())
                .andExpect(jsonPath("$[0].statusNovo").value("ABERTA"))
                .andExpect(jsonPath("$[0].alteradoPor.nome").value("Ana Ribeiro"));
    }

    @Test
    void vagaGuardaAsHabilidadesDesejadas() throws Exception {
        Instant inicio = Instant.now().plus(10, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS).plus(14, ChronoUnit.HOURS);
        String resposta = como(ANA, post("/api/oportunidades").content("""
                {"titulo": "Cobertura fotográfica", "descricao": "Registrar o evento de fim de ano do instituto.",
                 "causa": "COMUNICACAO", "local": "Rua XV de Novembro, 1200", "cidade": "Joinville", "uf": "SC",
                 "inicio": "%s", "fim": "%s", "vagas": 2,
                 "habilidadeIds": ["%s", "%s"]}
                """.formatted(inicio, inicio.plus(3, ChronoUnit.HOURS), habilidade(6), habilidade(5))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.habilidades[*].nome").value(contains("Comunicação e redes sociais", "Fotografia")))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(resposta, "$.id");

        // Na edição, a lista substitui a anterior
        como(ANA, put("/api/oportunidades/" + id).content(vagaCompleta("Cobertura fotográfica", null)
                .replace("\"responsavelId\": null", "\"responsavelId\": null, \"habilidadeIds\": [\"%s\"]".formatted(habilidade(5)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.habilidades[*].nome").value(contains("Fotografia")));
    }

    @Test
    void habilidadeDesejadaPrecisaSerDoCatalogo() throws Exception {
        como(ANA, post("/api/oportunidades").content(vagaCompleta("Vaga Z", null)
                .replace("\"responsavelId\": null", "\"responsavelId\": null, \"habilidadeIds\": [\"%s\"]".formatted(habilidade(99)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("habilidadeIds"));
    }

    @Test
    void gestorEscolheUmCoordenadorComoResponsavel() throws Exception {
        como(ANA, post("/api/oportunidades").content(vagaCompleta("Oficina de redação", usuario(2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.responsavel.nome").value("Bruno Costa"));
    }

    @Test
    void responsavelPrecisaSerDaEquipeEAtivo() throws Exception {
        // Bruno (2) é de outra organização para o Diego; Marcos (12) é da Patas Amigas, mas inativo
        como(DIEGO, post("/api/oportunidades").content(vagaCompleta("Vaga X", usuario(2))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("responsavelId"));
        como(DIEGO, post("/api/oportunidades").content(vagaCompleta("Vaga Y", usuario(12))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("responsavelId"));
    }

    @Test
    void soOGestorCria() throws Exception {
        como(BRUNO, post("/api/oportunidades").content(vagaCompleta("Vaga do coordenador", null)))
                .andExpect(status().isForbidden());
        como(FERNANDA, post("/api/oportunidades").content(vagaCompleta("Vaga da voluntária", null)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/oportunidades").contentType(MediaType.APPLICATION_JSON)
                .content(vagaCompleta("Sem login", null)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void vagaAbertaPrecisaDoAnuncioCompleto() throws Exception {
        como(ANA, post("/api/oportunidades").content("""
                {"titulo": "Só o título"}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[*].campo").value(containsInAnyOrder(
                        "descricao", "causa", "local", "cidade", "uf", "inicio", "fim", "vagas")));
    }

    @Test
    void recusaInicioNoPassadoETerminoAntesDoInicio() throws Exception {
        Instant ontem = Instant.now().minus(1, ChronoUnit.DAYS);
        como(ANA, post("/api/oportunidades").content(vagaComPeriodo("Passado", ontem, ontem.plus(2, ChronoUnit.HOURS))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("inicio"));

        Instant amanha = Instant.now().plus(1, ChronoUnit.DAYS);
        como(ANA, post("/api/oportunidades").content(vagaComPeriodo("Ao contrário", amanha, amanha.minus(1, ChronoUnit.HOURS))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("fim"));
    }

    // ---------- rascunho e publicação ----------

    @Test
    void rascunhoNasceSoComTituloNaoApareceNaBuscaEPublicaQuandoCompleto() throws Exception {
        String id = criarRascunho("Campanha do agasalho");

        mvc.perform(get("/api/oportunidades").param("texto", "agasalho"))
                .andExpect(jsonPath("$.total").value(0));

        como(ANA, put("/api/oportunidades/" + id).content(vagaCompleta("Campanha do agasalho", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RASCUNHO"));
        como(ANA, post("/api/oportunidades/" + id + "/publicar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ABERTA"));

        como(ANA, get("/api/organizacao/oportunidades/" + id + "/historico"))
                .andExpect(jsonPath("$[*].statusNovo").value(contains("RASCUNHO", "ABERTA")));
    }

    @Test
    void rascunhoIncompletoNaoPublica() throws Exception {
        String id = criarRascunho("Bazar de inverno");
        como(ANA, post("/api/oportunidades/" + id + "/publicar"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[*].campo").value(hasItem("descricao")));
    }

    // ---------- editar ----------

    @Test
    void responsavelEditaASuaVagaMasNaoADosOutros() throws Exception {
        como(BRUNO, put("/api/oportunidades/" + vaga(1)).content(vagaCompleta("Apoio escolar (turma da tarde)", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Apoio escolar (turma da tarde)"))
                .andExpect(jsonPath("$.responsavel.nome").value("Bruno Costa"));
        como(CARLA, put("/api/oportunidades/" + vaga(1)).content(vagaCompleta("Tentativa", null)))
                .andExpect(status().isForbidden());
        // Vaga de outra organização: 404, para não revelar que existe
        como(DIEGO, put("/api/oportunidades/" + vaga(1)).content(vagaCompleta("Tentativa", null)))
                .andExpect(status().isNotFound());
    }

    @Test
    void gestorTrocaOResponsavel() throws Exception {
        como(ANA, put("/api/oportunidades/" + vaga(1)).content(vagaCompleta("Apoio escolar", usuario(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responsavel.nome").value("Carla Mendes"));
    }

    @Test
    void coordenadorNaoTrocaOResponsavel() throws Exception {
        como(BRUNO, put("/api/oportunidades/" + vaga(1)).content(vagaCompleta("Apoio escolar", usuario(3))))
                .andExpect(status().isForbidden());
    }

    @Test
    void vagasNaoFicamAbaixoDosConfirmados() throws Exception {
        // A vaga 2 tem 2 voluntários confirmados
        como(CARLA, put("/api/oportunidades/" + vaga(2)).content(vagaComQuantidade("Educação ambiental", 1)))
                .andExpect(status().isConflict());
    }

    @Test
    void naoEditaVagaEncerrada() throws Exception {
        como(BRUNO, put("/api/oportunidades/" + vaga(3)).content(vagaCompleta("Evento", null)))
                .andExpect(status().isConflict());
    }

    // ---------- encerrar e cancelar ----------

    @Test
    void encerrarTiraDaBuscaEEhDefinitivo() throws Exception {
        como(BRUNO, post("/api/oportunidades/" + vaga(1) + "/encerrar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENCERRADA"));
        mvc.perform(get("/api/oportunidades"))
                .andExpect(jsonPath("$.itens[*].id").value(not(hasItem(vaga(1)))));
        como(BRUNO, post("/api/oportunidades/" + vaga(1) + "/encerrar"))
                .andExpect(status().isConflict());
    }

    @Test
    void cancelarGuardaOMotivoNoHistorico() throws Exception {
        como(CARLA, post("/api/oportunidades/" + vaga(2) + "/cancelar").content("""
                {"motivo": "Escola fechada para reforma"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
        como(CARLA, get("/api/organizacao/oportunidades/" + vaga(2) + "/historico"))
                .andExpect(jsonPath("$[-1].statusNovo").value("CANCELADA"))
                .andExpect(jsonPath("$[-1].observacao").value("Escola fechada para reforma"));
    }

    @Test
    void cancelarSemCorpoTambemFunciona() throws Exception {
        // Rascunho 4 (Ana): cancelar rascunho = descartar
        como(ANA, post("/api/oportunidades/" + vaga(4) + "/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA"));
    }

    // ---------- listar ----------

    @Test
    void gestorVeTodasAsVagasDaOrganizacaoECoordenadorSoAsDele() throws Exception {
        como(ANA, get("/api/organizacao/oportunidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(containsInAnyOrder(vaga(1), vaga(2), vaga(3), vaga(4), vaga(5))));
        como(BRUNO, get("/api/organizacao/oportunidades"))
                .andExpect(jsonPath("$[*].id").value(containsInAnyOrder(vaga(1), vaga(3))));
        como(FERNANDA, get("/api/organizacao/oportunidades"))
                .andExpect(status().isForbidden());
    }

    @Test
    void mostraAOrganizacaoDeQuemEstaLogado() throws Exception {
        como(CARLA, get("/api/organizacao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Instituto Novos Caminhos"));
    }

    // ---------- ajudantes ----------

    private String criarRascunho(String titulo) throws Exception {
        String resposta = como(ANA, post("/api/oportunidades").content("""
                {"titulo": "%s", "rascunho": true}
                """.formatted(titulo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("RASCUNHO"))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }

    /** Faz a requisição já logado como a pessoa (senha da massa: Voluntare@2026). */
    private ResultActions como(String email, MockHttpServletRequestBuilder requisicao) throws Exception {
        String login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"%s\", \"senha\": \"%s\"}".formatted(email, Demo.SENHA)))
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(login, "$.token");
        return mvc.perform(requisicao
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON));
    }

    /** Vaga completa daqui a 10 dias, das 14h às 18h (UTC), com 5 vagas. */
    private static String vagaCompleta(String titulo, String responsavelId) {
        Instant inicio = Instant.now().plus(10, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS).plus(14, ChronoUnit.HOURS);
        return json(titulo, inicio, inicio.plus(4, ChronoUnit.HOURS), 5, responsavelId);
    }

    private static String vagaComPeriodo(String titulo, Instant inicio, Instant fim) {
        return json(titulo, inicio, fim, 5, null);
    }

    private static String vagaComQuantidade(String titulo, int vagas) {
        Instant inicio = Instant.now().plus(10, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS).plus(14, ChronoUnit.HOURS);
        return json(titulo, inicio, inicio.plus(4, ChronoUnit.HOURS), vagas, null);
    }

    private static String json(String titulo, Instant inicio, Instant fim, int vagas, String responsavelId) {
        return """
                {"titulo": "%s", "descricao": "Descrição completa da atividade para os voluntários.",
                 "causa": "EDUCACAO", "local": "Rua XV de Novembro, 1200", "cidade": "Joinville", "uf": "SC",
                 "inicio": "%s", "fim": "%s", "vagas": %d, "responsavelId": %s}
                """.formatted(titulo, inicio, fim, vagas, responsavelId == null ? "null" : "\"" + responsavelId + "\"");
    }
}

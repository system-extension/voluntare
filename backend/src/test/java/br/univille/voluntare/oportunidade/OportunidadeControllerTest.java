package br.univille.voluntare.oportunidade;

import static br.univille.voluntare.Demo.organizacao;
import static br.univille.voluntare.Demo.vaga;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import br.univille.voluntare.TestcontainersConfiguration;

/**
 * Busca e detalhe de oportunidades contra o banco real com a massa da V8.
 * Abertas: 8 (mais recente), 6, 1 e 2. Vagas disponíveis: 8 → 2, 6 → 4, 1 → 2, 2 → 0 (preenchida).
 * 3 está encerrada, 4 é rascunho, 5 está cancelada e 7 encerrada. vaga(n) e organizacao(n) vêm de Demo.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class OportunidadeControllerTest {

    @Autowired
    private MockMvc mvc;

    // ---------- busca ----------

    @Test
    void listaSoAsAbertasDasMaisRecentesParaAsMaisAntigas() throws Exception {
        mvc.perform(get("/api/oportunidades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(8), vaga(6), vaga(1), vaga(2))))
                .andExpect(jsonPath("$.pagina").value(1))
                .andExpect(jsonPath("$.tamanho").value(15))
                .andExpect(jsonPath("$.total").value(4))
                .andExpect(jsonPath("$.totalPaginas").value(1));
    }

    @Test
    void calculaAsVagasDisponiveisDescontandoAsParticipacoes() throws Exception {
        mvc.perform(get("/api/oportunidades"))
                .andExpect(jsonPath("$.itens[*].vagasDisponiveis").value(contains(2, 4, 2, 0)));
    }

    @Test
    void textoIgnoraAcentosEMaiusculasEProcuraNaCausa() throws Exception {
        // 1 é da causa Educação; 2 tem "Educação" no título
        mvc.perform(get("/api/oportunidades").param("texto", "EDUCACAO"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(1), vaga(2))));
        mvc.perform(get("/api/oportunidades").param("texto", "meio ambiente"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(2))));
    }

    @Test
    void textoProcuraNoNomeDaOrganizacao() throws Exception {
        mvc.perform(get("/api/oportunidades").param("texto", "patas amigas"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(8), vaga(6))));
    }

    @Test
    void curingaDigitadoNoTextoEhTratadoComoCaractereComum() throws Exception {
        // Sem o escape, "_" casaria com qualquer letra e traria todas
        mvc.perform(get("/api/oportunidades").param("texto", "_"))
                .andExpect(jsonPath("$.itens").value(empty()))
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.totalPaginas").value(1));
    }

    @Test
    void localProcuraNaCidadeSemAcento() throws Exception {
        mvc.perform(get("/api/oportunidades").param("local", "sao paulo"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(8), vaga(6))));
    }

    @Test
    void filtraPorCausaEPorOrganizacao() throws Exception {
        mvc.perform(get("/api/oportunidades").param("causa", "ANIMAIS"))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(6))));
        mvc.perform(get("/api/oportunidades").param("organizacaoId", organizacao(1)))
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(1), vaga(2))));
    }

    @Test
    void buscaTrazAsHabilidadesDeCadaVaga() throws Exception {
        // Vaga 8 (a mais recente): Fotografia e Comunicação e redes sociais
        mvc.perform(get("/api/oportunidades"))
                .andExpect(jsonPath("$.itens[0].habilidades[*].nome")
                        .value(contains("Comunicação e redes sociais", "Fotografia")));
    }

    @Test
    void paginaComecaEmUm() throws Exception {
        mvc.perform(get("/api/oportunidades").param("pagina", "2").param("tamanho", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[*].id").value(contains(vaga(2))))
                .andExpect(jsonPath("$.pagina").value(2))
                .andExpect(jsonPath("$.tamanho").value(3))
                .andExpect(jsonPath("$.total").value(4))
                .andExpect(jsonPath("$.totalPaginas").value(2));
    }

    @Test
    void recusaPaginacaoForaDosLimites() throws Exception {
        mvc.perform(get("/api/oportunidades").param("pagina", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.campos[0].campo").value("pagina"))
                .andExpect(jsonPath("$.campos[0].mensagem").value("A página começa em 1."));
        mvc.perform(get("/api/oportunidades").param("tamanho", "51"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("tamanho"));
    }

    @Test
    void recusaCausaInexistente() throws Exception {
        mvc.perform(get("/api/oportunidades").param("causa", "SAUDE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("causa"))
                .andExpect(jsonPath("$.campos[0].mensagem").value("Valor inválido."));
    }

    // ---------- detalhe ----------

    @Test
    void detalhaUmaOportunidadeAberta() throws Exception {
        mvc.perform(get("/api/oportunidades/" + vaga(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Apoio escolar para crianças"))
                .andExpect(jsonPath("$.status").value("ABERTA"))
                .andExpect(jsonPath("$.causa").value("EDUCACAO"))
                .andExpect(jsonPath("$.uf").value("SC"))
                .andExpect(jsonPath("$.vagas").value(3))
                .andExpect(jsonPath("$.vagasDisponiveis").value(2))
                .andExpect(jsonPath("$.atividades").isNotEmpty())
                .andExpect(jsonPath("$.organizacao.id").value(organizacao(1)))
                .andExpect(jsonPath("$.organizacao.nome").value("Instituto Novos Caminhos"))
                .andExpect(jsonPath("$.responsavel.nome").value("Bruno Costa"))
                .andExpect(jsonPath("$.habilidades[*].nome").value(contains("Ensino e reforço escolar")));
    }

    @Test
    void encerradaContinuaVisivelECancelamentoTardioOcupaVaga() throws Exception {
        // 3: presente, presente, ausente e cancelada tardia → as 4 vagas ocupadas
        mvc.perform(get("/api/oportunidades/" + vaga(3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENCERRADA"))
                .andExpect(jsonPath("$.vagasDisponiveis").value(0));
    }

    @Test
    void rascunhoEInexistenteRespondem404() throws Exception {
        mvc.perform(get("/api/oportunidades/" + vaga(4)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").value("Oportunidade não encontrada."));
        mvc.perform(get("/api/oportunidades/" + vaga(999)))
                .andExpect(status().isNotFound());
    }

    @Test
    void idQueNaoEhNumeroResponde400() throws Exception {
        mvc.perform(get("/api/oportunidades/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos[0].campo").value("id"));
    }

    // ---------- documentação ----------

    @Test
    void documentacaoDaApiEstaDisponivel() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/oportunidades']").exists());
    }
}

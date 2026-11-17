package br.univille.voluntare.banco;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import br.univille.voluntare.TestcontainersConfiguration;

/**
 * Confere que a massa de demonstração (V2) respeita as regras que ficam no service,
 * já que ela entra direto pelo SQL. Cada consulta lista o que quebraria a regra e deve voltar vazia.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class CargaDemonstracaoTest {

    @Autowired
    private JdbcTemplate jdbc;

    static Stream<Arguments> regras() {
        return Stream.of(
                regra("confirmados não passam das vagas", """
                        SELECT o.id FROM oportunidade o
                        JOIN candidatura c ON c.oportunidade_id = o.id
                        JOIN participacao p ON p.candidatura_id = c.id
                        WHERE p.status <> 'CANCELADA'
                        GROUP BY o.id, o.vagas HAVING count(*) > o.vagas
                        """),
                regra("participação só de candidatura aceita", """
                        SELECT p.id FROM participacao p JOIN candidatura c ON c.id = p.candidatura_id
                        WHERE c.status <> 'ACEITA'
                        """),
                regra("toda candidatura aceita tem participação", """
                        SELECT c.id FROM candidatura c LEFT JOIN participacao p ON p.candidatura_id = c.id
                        WHERE c.status = 'ACEITA' AND p.id IS NULL
                        """),
                regra("todo registro tem linha de criação no histórico", """
                        SELECT o.id FROM oportunidade o WHERE NOT EXISTS
                            (SELECT 1 FROM historico_status h WHERE h.oportunidade_id = o.id AND h.status_anterior IS NULL)
                        UNION ALL
                        SELECT c.id FROM candidatura c WHERE NOT EXISTS
                            (SELECT 1 FROM historico_status h WHERE h.candidatura_id = c.id AND h.status_anterior IS NULL)
                        UNION ALL
                        SELECT p.id FROM participacao p WHERE NOT EXISTS
                            (SELECT 1 FROM historico_status h WHERE h.participacao_id = p.id AND h.status_anterior IS NULL)
                        """),
                regra("status atual é o último do histórico", """
                        SELECT o.id FROM oportunidade o WHERE o.status <> (SELECT h.status_novo FROM historico_status h
                            WHERE h.oportunidade_id = o.id ORDER BY h.alterado_em DESC, h.id DESC LIMIT 1)
                        UNION ALL
                        SELECT c.id FROM candidatura c WHERE c.status <> (SELECT h.status_novo FROM historico_status h
                            WHERE h.candidatura_id = c.id ORDER BY h.alterado_em DESC, h.id DESC LIMIT 1)
                        UNION ALL
                        SELECT p.id FROM participacao p WHERE p.status <> (SELECT h.status_novo FROM historico_status h
                            WHERE h.participacao_id = p.id ORDER BY h.alterado_em DESC, h.id DESC LIMIT 1)
                        """),
                regra("candidatura criada pelo próprio voluntário", """
                        SELECT c.id FROM candidatura c
                        JOIN historico_status h ON h.candidatura_id = c.id AND h.status_anterior IS NULL
                        WHERE h.alterado_por <> c.voluntario_id OR h.alterado_em <> c.criado_em
                        """),
                regra("só o gestor da organização ou o responsável decide candidatura", """
                        SELECT c.id FROM candidatura c
                        JOIN oportunidade o ON o.id = c.oportunidade_id
                        JOIN usuario u ON u.id = c.decidido_por
                        WHERE NOT ((u.papel = 'GESTOR' AND u.organizacao_id = o.organizacao_id) OR u.id = o.responsavel_id)
                        """),
                regra("só o gestor da organização ou o responsável registra presença", """
                        SELECT p.id FROM participacao p
                        JOIN candidatura c ON c.id = p.candidatura_id
                        JOIN oportunidade o ON o.id = c.oportunidade_id
                        JOIN usuario u ON u.id = p.registrado_por
                        WHERE NOT ((u.papel = 'GESTOR' AND u.organizacao_id = o.organizacao_id) OR u.id = o.responsavel_id)
                        """),
                regra("presença só depois do fim", """
                        SELECT p.id FROM participacao p
                        JOIN candidatura c ON c.id = p.candidatura_id
                        JOIN oportunidade o ON o.id = c.oportunidade_id
                        WHERE p.registrado_em < o.fim
                        """),
                regra("horas dentro da duração", """
                        SELECT p.id FROM participacao p
                        JOIN candidatura c ON c.id = p.candidatura_id
                        JOIN oportunidade o ON o.id = c.oportunidade_id
                        WHERE p.horas_realizadas > extract(epoch FROM o.fim - o.inicio) / 3600
                        """),
                regra("cancelamento classificado pelo prazo do parâmetro", """
                        SELECT p.id FROM participacao p
                        JOIN candidatura c ON c.id = p.candidatura_id
                        JOIN oportunidade o ON o.id = c.oportunidade_id
                        CROSS JOIN (SELECT valor::int * interval '1 hour' AS prazo
                                    FROM parametro WHERE chave = 'prazo_devolucao_vaga_horas') x
                        WHERE (p.status = 'CANCELADA' AND p.cancelado_em > o.inicio - x.prazo)
                           OR (p.status = 'CANCELADA_TARDIA' AND p.cancelado_em <= o.inicio - x.prazo)
                        """),
                regra("candidatura só em vaga publicada e depois dela", """
                        SELECT c.id FROM candidatura c JOIN oportunidade o ON o.id = c.oportunidade_id
                        WHERE o.status = 'RASCUNHO' OR c.criado_em < o.criado_em OR c.decidido_em < c.criado_em
                        """),
                regra("perfil de voluntário só para voluntário", """
                        SELECT u.id FROM perfil_voluntario pv JOIN usuario u ON u.id = pv.usuario_id
                        WHERE u.papel <> 'VOLUNTARIO'
                        """),
                regra("vaga aberta não fica com responsável inativo", """
                        SELECT o.id FROM oportunidade o JOIN usuario u ON u.id = o.responsavel_id
                        WHERE o.status = 'ABERTA' AND NOT u.ativo
                        """));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("regras")
    void cargaRespeitaRegra(String regra, String consultaDasViolacoes) {
        List<Map<String, Object>> violacoes = jdbc.queryForList(consultaDasViolacoes);

        assertThat(violacoes).as(regra).isEmpty();
    }

    @Test
    void cargaCobreTodosOsStatus() {
        assertThat(jdbc.queryForList("SELECT DISTINCT status FROM oportunidade", String.class))
                .containsExactlyInAnyOrder("RASCUNHO", "ABERTA", "ENCERRADA", "CANCELADA");
        assertThat(jdbc.queryForList("SELECT DISTINCT status FROM candidatura", String.class))
                .containsExactlyInAnyOrder("PENDENTE", "ACEITA", "REJEITADA", "CANCELADA");
        assertThat(jdbc.queryForList("SELECT DISTINCT status FROM participacao", String.class))
                .containsExactlyInAnyOrder("CONFIRMADA", "PRESENTE", "AUSENTE", "CANCELADA", "CANCELADA_TARDIA");
    }

    @Test
    void identidadesContinuamDepoisDaCarga() {
        Long novoId = jdbc.queryForObject("""
                INSERT INTO habilidade (nome) VALUES ('Habilidade criada no teste') RETURNING id
                """, Long.class);

        assertThat(novoId).isGreaterThan(10L);
        jdbc.update("DELETE FROM habilidade WHERE id = ?", novoId);
    }

    private static Arguments regra(String regra, String consultaDasViolacoes) {
        return Arguments.of(regra, consultaDasViolacoes);
    }
}

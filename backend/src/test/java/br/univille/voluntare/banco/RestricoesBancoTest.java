package br.univille.voluntare.banco;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.util.Arrays;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.Demo;
import br.univille.voluntare.TestcontainersConfiguration;

/**
 * Confere que o banco barra, sozinho, os dados que violam as restrições do DER.
 * Usa a massa da V8: organização 1 (gestora 1, coordenadores 2 e 3), organização 2 (gestor 4)
 * e voluntários a partir do usuário 6. Nos SQLs, :vaga1, :usuario4 etc. viram os UUIDs fixos (Demo.sql). Cada caso roda numa transação desfeita no fim.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class RestricoesBancoTest {

    @Autowired
    private JdbcTemplate jdbc;

    static Stream<Arguments> violacoes() {
        return Stream.of(
                // Usuário e organização
                caso("voluntário com organização", "ck_usuario_organizacao",
                        "INSERT INTO usuario (organizacao_id, nome, email, senha_hash, papel) VALUES (:organizacao1, 'X', 'x1@example.com', 'h', 'VOLUNTARIO')"),
                caso("coordenador sem organização", "ck_usuario_organizacao",
                        "INSERT INTO usuario (organizacao_id, nome, email, senha_hash, papel) VALUES (NULL, 'X', 'x2@example.com', 'h', 'COORDENADOR')"),
                caso("papel ADMINISTRADOR não existe", "ck_usuario_papel",
                        "INSERT INTO usuario (organizacao_id, nome, email, senha_hash, papel) VALUES (:organizacao1, 'X', 'x3@example.com', 'h', 'ADMINISTRADOR')"),
                caso("e-mail duplicado com maiúsculas", "ux_usuario_email",
                        "INSERT INTO usuario (organizacao_id, nome, email, senha_hash, papel) VALUES (NULL, 'X', 'FERNANDA@Example.com', 'h', 'VOLUNTARIO')"),
                caso("organização duplicada com minúsculas", "ux_organizacao_nome",
                        "INSERT INTO organizacao (nome, cidade, uf, email) VALUES ('instituto novos caminhos', 'Joinville', 'SC', 'a@example.org')"),
                caso("UF minúscula", "ck_organizacao_uf",
                        "INSERT INTO organizacao (nome, cidade, uf, email) VALUES ('Nova ONG', 'Joinville', 'sc', 'a@example.org')"),

                // Responsável da oportunidade (FK composta)
                caso("responsável de outra organização", "fk_oportunidade_responsavel",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo) VALUES (:organizacao1, :usuario4, 'X')"),
                caso("voluntário como responsável", "fk_oportunidade_responsavel",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo) VALUES (:organizacao1, :usuario6, 'X')"),
                caso("coordenador trocado de organização com vaga sob sua responsabilidade", "fk_oportunidade_responsavel",
                        "UPDATE usuario SET organizacao_id = :organizacao2 WHERE id = :usuario2"),
                caso("coordenador responsável virar voluntário", "fk_oportunidade_responsavel",
                        "UPDATE usuario SET papel = 'VOLUNTARIO', organizacao_id = NULL WHERE id = :usuario3"),

                // Oportunidade
                caso("vaga aberta incompleta", "ck_oportunidade_completa",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo, status) VALUES (:organizacao1, :usuario2, 'X', 'ABERTA')"),
                caso("causa inválida", "ck_oportunidade_causa",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo, causa) VALUES (:organizacao1, :usuario2, 'X', 'SAUDE')"),
                caso("vagas acima de 999", "ck_oportunidade_vagas",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo, vagas) VALUES (:organizacao1, :usuario2, 'X', 1000)"),
                caso("fim antes do início", "ck_oportunidade_periodo",
                        "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo, inicio, fim) VALUES (:organizacao1, :usuario2, 'X', now(), now() - interval '1 hour')"),

                // Candidatura e participação
                caso("candidatura duplicada", "uk_candidatura_oportunidade_voluntario",
                        "INSERT INTO candidatura (oportunidade_id, voluntario_id) VALUES (:vaga1, :usuario6)"),
                caso("candidatura de quem não é voluntário", "fk_candidatura_voluntario",
                        "INSERT INTO candidatura (oportunidade_id, voluntario_id) VALUES (:vaga1, :usuario1)"),
                caso("aceite sem quem decidiu", "ck_candidatura_decisao",
                        "UPDATE candidatura SET status = 'ACEITA' WHERE id = :candidatura2"),
                caso("PRESENTE sem horas", "ck_participacao_horas_presente",
                        "UPDATE participacao SET status = 'PRESENTE', registrado_em = now(), registrado_por = :usuario2 WHERE id = :participacao1"),
                caso("horas zero", "ck_participacao_horas_positivas",
                        "UPDATE participacao SET status = 'PRESENTE', horas_realizadas = 0, registrado_em = now(), registrado_por = :usuario2 WHERE id = :participacao1"),
                caso("cancelada sem data", "ck_participacao_cancelamento",
                        "UPDATE participacao SET status = 'CANCELADA' WHERE id = :participacao1"),
                caso("segunda participação da mesma candidatura", "uk_participacao_candidatura",
                        "INSERT INTO participacao (candidatura_id) VALUES (:candidatura1)"),

                // Histórico
                caso("histórico em duas entidades", "ck_hist_uma_entidade",
                        "INSERT INTO historico_status (oportunidade_id, candidatura_id, status_novo, alterado_por) VALUES (:vaga1, :candidatura1, 'ABERTA', :usuario1)"),
                caso("segunda linha de criação", "ux_hist_criacao_oportunidade",
                        "INSERT INTO historico_status (oportunidade_id, status_novo, alterado_por) VALUES (:vaga1, 'ABERTA', :usuario1)"),
                caso("histórico sem mudança de status", "ck_hist_mudanca",
                        "INSERT INTO historico_status (oportunidade_id, status_anterior, status_novo, alterado_por) VALUES (:vaga1, 'ABERTA', 'ABERTA', :usuario1)"),

                // Sem exclusão física
                caso("excluir oportunidade com histórico", "fk_hist_oportunidade|fk_oh_oportunidade",
                        "DELETE FROM oportunidade WHERE id = :vaga4"),
                caso("excluir organização com equipe", "fk_usuario_organizacao|fk_oportunidade_organizacao",
                        "DELETE FROM organizacao WHERE id = :organizacao2"),

                // Habilidades (V9)
                caso("habilidade desejada repetida na mesma vaga", "pk_oportunidade_habilidade",
                        "INSERT INTO oportunidade_habilidade (oportunidade_id, habilidade_id) VALUES (:vaga1, :habilidade1)"),
                caso("excluir habilidade usada por vaga ou voluntário", "fk_oh_habilidade|fk_vh_habilidade",
                        "DELETE FROM habilidade WHERE id = :habilidade1"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("violacoes")
    void bancoBarraViolacao(String descricao, String restricoesEsperadas, String sql) {
        DataIntegrityViolationException erro = catchThrowableOfType(DataIntegrityViolationException.class,
                () -> jdbc.update(sql));

        assertThat(erro).as("o banco deveria barrar: %s", descricao).isNotNull();
        String mensagem = erro.getMostSpecificCause().getMessage();
        assertThat(Arrays.stream(restricoesEsperadas.split("\\|")))
                .as("restrição violada em: %s", mensagem)
                .anyMatch(restricao -> mensagem.contains("\"" + restricao + "\""));
    }

    @Test
    void rascunhoPodeSerSalvoIncompleto() {
        assertThatCode(() -> jdbc.update(Demo.sql(
                "INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo) VALUES (:organizacao1, :usuario2, 'Rascunho')")))
                .doesNotThrowAnyException();
    }

    @Test
    void vagaAbertaCompletaComResponsavelDaOrganizacaoEhAceita() {
        assertThatCode(() -> jdbc.update(Demo.sql("""
                INSERT INTO oportunidade (organizacao_id, responsavel_id, titulo, descricao, causa, local, cidade, uf,
                                          inicio, fim, vagas, status)
                VALUES (:organizacao1, :usuario3, 'Vaga', 'Descrição', 'EDUCACAO', 'Rua A, 1', 'Joinville', 'SC',
                        now() + interval '1 day', now() + interval '1 day 2 hours', 5, 'ABERTA')
                """)))
                .doesNotThrowAnyException();
    }

    private static Arguments caso(String descricao, String restricoesEsperadas, String sql) {
        return Arguments.of(descricao, restricoesEsperadas, Demo.sql(sql));
    }
}

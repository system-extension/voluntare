package br.univille.voluntare;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

import br.univille.voluntare.candidatura.entity.Candidatura;
import br.univille.voluntare.oportunidade.dto.OportunidadeRequest;
import br.univille.voluntare.oportunidade.entity.Causa;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.organizacao.entity.Organizacao;
import br.univille.voluntare.participacao.entity.Participacao;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.voluntario.entity.Habilidade;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;

/**
 * Monta objetos do domínio em memória para os testes unitários (sem Spring e sem banco).
 * Os ids ficam nulos, porque quem gera é o Hibernate ao salvar; quando o teste precisa de id, ele é informado.
 */
public final class Fabrica {

    private Fabrica() {
    }

    public static Organizacao organizacao() {
        return new Organizacao("Instituto Teste", null, "Joinville", "SC", "contato@teste.example.org", null);
    }

    public static Usuario gestor() {
        return Usuario.gestor(organizacao(), "Gestora Teste", "gestora@teste.example.org", "hash");
    }

    public static PerfilVoluntario voluntario() {
        return new PerfilVoluntario(Usuario.voluntario("Voluntária Teste", "vol@teste.example.org", "hash"),
                "(47) 99999-0000", "Joinville");
    }

    /** Vaga completa no status pedido, entre os instantes informados, com 5 lugares. */
    public static Oportunidade vaga(StatusOportunidade status, Instant inicio, Instant fim) {
        Usuario gestor = gestor();
        return Oportunidade.nova(gestor.getOrganizacao(), gestor, status, new OportunidadeRequest(
                "Mutirão", "Descrição da atividade.", null, null, Causa.MEIO_AMBIENTE, "Praça Central",
                "Joinville", "SC", inicio, fim, 5, null, null, false));
    }

    /** Rascunho só com o título, como o formulário permite salvar. */
    public static Oportunidade rascunho() {
        Usuario gestor = gestor();
        return Oportunidade.nova(gestor.getOrganizacao(), gestor, StatusOportunidade.RASCUNHO,
                new OportunidadeRequest("Só o título", null, null, null, null, null, null, null, null, null, null,
                        null, null, true));
    }

    /** Participação confirmada (nasce do aceite) numa vaga entre os instantes informados. */
    public static Participacao participacaoConfirmada(StatusOportunidade statusDaVaga, Instant inicio, Instant fim) {
        return Participacao.confirmar(Candidatura.nova(vaga(statusDaVaga, inicio, fim), voluntario()));
    }

    public static Habilidade habilidade(String nome) {
        Habilidade habilidade = BeanUtils.instantiateClass(Habilidade.class);
        ReflectionTestUtils.setField(habilidade, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(habilidade, "nome", nome);
        return habilidade;
    }
}

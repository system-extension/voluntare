package br.univille.voluntare.voluntario.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import br.univille.voluntare.Fabrica;

/**
 * Troca de habilidades e interesses do perfil. O ponto central: aplicar só a diferença,
 * sem apagar e recriar a mesma ligação (o Hibernate faria o INSERT antes do DELETE e violaria a chave).
 */
class PerfilVoluntarioTest {

    private final Habilidade ensino = Fabrica.habilidade("Ensino");
    private final Habilidade fotografia = Fabrica.habilidade("Fotografia");
    private final Habilidade cozinha = Fabrica.habilidade("Cozinha");

    @Test
    void separaHabilidadesDeInteresses() {
        PerfilVoluntario perfil = Fabrica.voluntario();
        perfil.definirHabilidades(List.of(ensino, fotografia), List.of(cozinha));

        assertThat(tipos(perfil)).containsExactlyInAnyOrderEntriesOf(Map.of(
                "Ensino", TipoHabilidade.HABILIDADE,
                "Fotografia", TipoHabilidade.HABILIDADE,
                "Cozinha", TipoHabilidade.INTERESSE));
    }

    @Test
    void mudarDeListaMantemAMesmaLigacao() {
        PerfilVoluntario perfil = Fabrica.voluntario();
        perfil.definirHabilidades(List.of(ensino), List.of());
        VoluntarioHabilidade ligacao = perfil.getHabilidades().iterator().next();

        perfil.definirHabilidades(List.of(), List.of(ensino));

        assertThat(perfil.getHabilidades()).containsExactly(ligacao);
        assertThat(ligacao.getTipo()).isEqualTo(TipoHabilidade.INTERESSE);
    }

    @Test
    void removeOQueSaiuEMantemOQueFicou() {
        PerfilVoluntario perfil = Fabrica.voluntario();
        perfil.definirHabilidades(List.of(ensino, fotografia), List.of());
        perfil.definirHabilidades(List.of(fotografia), List.of());

        assertThat(tipos(perfil)).containsOnlyKeys("Fotografia");
    }

    private static Map<String, TipoHabilidade> tipos(PerfilVoluntario perfil) {
        return perfil.getHabilidades().stream()
                .collect(Collectors.toMap(vh -> vh.getHabilidade().getNome(), VoluntarioHabilidade::getTipo));
    }
}

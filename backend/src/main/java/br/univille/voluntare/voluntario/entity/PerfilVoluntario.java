package br.univille.voluntare.voluntario.entity;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import br.univille.voluntare.usuario.entity.Usuario;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Perfil do voluntário (tabela criada na V1). A chave é o próprio id do usuário (@MapsId):
 * um perfil por voluntário, sem sequência própria.
 */
@Entity
@Table(name = "perfil_voluntario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PerfilVoluntario {

    @Id
    @Column(name = "usuario_id")
    private UUID usuarioId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String cidade;

    private String disponibilidade;

    // Ligações com o catálogo. orphanRemoval: tirar da coleção apaga a linha da junção (não é histórico).
    @OneToMany(mappedBy = "voluntario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VoluntarioHabilidade> habilidades = new HashSet<>();

    public PerfilVoluntario(Usuario usuario, String telefone, String cidade) {
        this.usuario = usuario;
        this.telefone = telefone;
        this.cidade = cidade;
    }

    public void atualizarContato(String telefone, String cidade, String disponibilidade) {
        this.telefone = telefone;
        this.cidade = cidade;
        this.disponibilidade = disponibilidade;
    }

    /**
     * Troca as habilidades e os interesses pelos informados.
     * Aplica só a diferença (remove, muda o tipo, adiciona) em vez de apagar tudo e recriar:
     * o Hibernate grava os INSERTs antes dos DELETEs, e recriar a mesma chave daria violação de chave primária.
     * A comparação é pelo id, porque a habilidade de uma ligação pode estar carregada como proxy do Hibernate.
     */
    public void definirHabilidades(Collection<Habilidade> sabeFazer, Collection<Habilidade> querAprender) {
        Map<UUID, TipoHabilidade> tipos = new HashMap<>();
        Map<UUID, Habilidade> porId = new HashMap<>();
        sabeFazer.forEach(h -> { tipos.put(h.getId(), TipoHabilidade.HABILIDADE); porId.put(h.getId(), h); });
        querAprender.forEach(h -> { tipos.put(h.getId(), TipoHabilidade.INTERESSE); porId.put(h.getId(), h); });

        habilidades.removeIf(atual -> !tipos.containsKey(atual.getChave().getHabilidadeId()));
        tipos.forEach((id, tipo) -> habilidades.stream()
                .filter(atual -> atual.getChave().getHabilidadeId().equals(id))
                .findFirst()
                .ifPresentOrElse(
                        atual -> atual.mudarTipo(tipo),
                        () -> habilidades.add(new VoluntarioHabilidade(this, porId.get(id), tipo))));
    }
}

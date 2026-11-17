package br.univille.voluntare.voluntario.entity;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Liga o voluntário a uma habilidade do catálogo (tabela criada na V2).
 * A chave é (voluntário, habilidade): a mesma habilidade não é, ao mesmo tempo, habilidade e interesse.
 */
@Entity
@Table(name = "voluntario_habilidade")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VoluntarioHabilidade {

    @EmbeddedId
    private Chave chave;

    @MapsId("voluntarioId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voluntario_id")
    private PerfilVoluntario voluntario;

    @MapsId("habilidadeId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habilidade_id")
    private Habilidade habilidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoHabilidade tipo;

    VoluntarioHabilidade(PerfilVoluntario voluntario, Habilidade habilidade, TipoHabilidade tipo) {
        this.chave = new Chave(voluntario.getUsuarioId(), habilidade.getId());
        this.voluntario = voluntario;
        this.habilidade = habilidade;
        this.tipo = tipo;
    }

    void mudarTipo(TipoHabilidade novo) {
        this.tipo = novo;
    }

    @Embeddable
    @Getter
    @EqualsAndHashCode
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class Chave implements Serializable {

        @Column(name = "voluntario_id")
        private UUID voluntarioId;

        @Column(name = "habilidade_id")
        private UUID habilidadeId;

        Chave(UUID voluntarioId, UUID habilidadeId) {
            this.voluntarioId = voluntarioId;
            this.habilidadeId = habilidadeId;
        }
    }
}

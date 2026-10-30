package br.univille.voluntare.historico.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.univille.voluntare.shared.util.UuidV7Generator;
import br.univille.voluntare.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Uma mudança de status (tabela criada na V5). Só se insere, nunca se altera.
 * Cada linha aponta para uma única entidade (ck_hist_uma_entidade); status_anterior nulo marca a criação.
 * As três FKs ficam como id simples para o histórico não depender das entidades de cada módulo.
 */
@Entity
@Table(name = "historico_status")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HistoricoStatus {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @Column(name = "oportunidade_id")
    private UUID oportunidadeId;

    @Column(name = "candidatura_id")
    private UUID candidaturaId;

    @Column(name = "participacao_id")
    private UUID participacaoId;

    @Column(name = "status_anterior", length = 20)
    private String statusAnterior;

    @Column(name = "status_novo", nullable = false, length = 20)
    private String statusNovo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alterado_por", nullable = false)
    private Usuario alteradoPor;

    @Column(name = "alterado_em", nullable = false)
    private Instant alteradoEm;

    @Column(length = 500)
    private String observacao;

    public static HistoricoStatus daOportunidade(UUID oportunidadeId, String anterior, String novo,
            Usuario alteradoPor, String observacao) {
        HistoricoStatus linha = new HistoricoStatus();
        linha.oportunidadeId = oportunidadeId;
        linha.statusAnterior = anterior;
        linha.statusNovo = novo;
        linha.alteradoPor = alteradoPor;
        linha.alteradoEm = Instant.now();
        linha.observacao = observacao;
        return linha;
    }
}

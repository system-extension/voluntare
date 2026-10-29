package br.univille.voluntare.oportunidade.entity;

import java.time.Instant;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.univille.voluntare.organizacao.entity.Organizacao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Oportunidade de voluntariado (tabela criada na V3). Por enquanto só leitura.
 * Em RASCUNHO os campos do anúncio podem estar nulos (ck_oportunidade_completa).
 */
@Entity
@Table(name = "oportunidade")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Oportunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    // Gestor ou coordenador da mesma organização (FK composta organizacao_id + responsavel_id).
    // Fica como id simples até existir a entidade Usuario: as duas FKs dividem a coluna organizacao_id.
    @Column(name = "responsavel_id", nullable = false)
    private Long responsavelId;

    @Column(nullable = false, length = 150)
    private String titulo;

    private String descricao;

    private String atividades;

    private String requisitos;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Causa causa;

    @Column(length = 200)
    private String local;

    @Column(length = 100)
    private String cidade;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 2)
    private String uf;

    private Instant inicio;

    private Instant fim;

    private Integer vagas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOportunidade status;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;
}

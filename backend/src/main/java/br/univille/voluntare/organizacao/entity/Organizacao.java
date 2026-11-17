package br.univille.voluntare.organizacao.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import br.univille.voluntare.shared.util.UuidV7Generator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** ONG que publica oportunidades (tabela criada na V1). Nasce no autocadastro, junto com o gestor. */
@Entity
@Table(name = "organizacao")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Organizacao {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String nome;

    private String descricao;

    @Column(nullable = false, length = 100)
    private String cidade;

    // CHAR(2) no banco. Sem o JdbcTypeCode o Hibernate espera VARCHAR e o ddl-auto: validate falha.
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, length = 2)
    private String uf;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false)
    private boolean ativa;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    public Organizacao(String nome, String descricao, String cidade, String uf, String email, String telefone) {
        this.nome = nome;
        this.descricao = descricao;
        this.cidade = cidade;
        this.uf = uf;
        this.email = email;
        this.telefone = telefone;
        this.ativa = true;
    }
}

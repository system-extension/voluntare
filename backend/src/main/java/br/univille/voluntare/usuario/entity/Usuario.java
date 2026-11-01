package br.univille.voluntare.usuario.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import br.univille.voluntare.organizacao.entity.Organizacao;
import br.univille.voluntare.shared.util.UuidV7Generator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Conta de acesso (tabela criada na V1). O papel decide o que a pessoa pode fazer.
 * As fábricas garantem a regra do CHECK ck_usuario_organizacao: voluntário sem organização, equipe com.
 */
@Entity
@Table(name = "usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizacao_id")
    private Organizacao organizacao;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel;

    @Column(nullable = false)
    private boolean ativo;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    private Usuario(Organizacao organizacao, String nome, String email, String senhaHash, Papel papel) {
        this.organizacao = organizacao;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.papel = papel;
        this.ativo = true;
    }

    public static Usuario voluntario(String nome, String email, String senhaHash) {
        return new Usuario(null, nome, email, senhaHash, Papel.VOLUNTARIO);
    }

    public static Usuario gestor(Organizacao organizacao, String nome, String email, String senhaHash) {
        return new Usuario(organizacao, nome, email, senhaHash, Papel.GESTOR);
    }

    public void renomear(String nome) {
        this.nome = nome;
    }

    /** Pode entrar: conta ativa e, se for da equipe, organização ativa. */
    public boolean podeAcessar() {
        return ativo && (organizacao == null || organizacao.isAtiva());
    }
}

package br.univille.voluntare.candidatura.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.shared.util.UuidV7Generator;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;
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
 * Pedido do voluntário para participar de uma vaga (tabela criada na V4).
 * Uma por voluntário e vaga (uk_candidatura_oportunidade_voluntario).
 * Depois do aceite ela continua ACEITA para sempre: desistências passam a ser da participação.
 */
@Entity
@Table(name = "candidatura")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Candidatura {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "oportunidade_id", nullable = false)
    private Oportunidade oportunidade;

    // A FK aponta para perfil_voluntario: só quem tem perfil de voluntário se candidata
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voluntario_id", nullable = false)
    private PerfilVoluntario voluntario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCandidatura status;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "decidido_em")
    private Instant decididoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decidido_por")
    private Usuario decididoPor;

    public static Candidatura nova(Oportunidade oportunidade, PerfilVoluntario voluntario) {
        Candidatura candidatura = new Candidatura();
        candidatura.oportunidade = oportunidade;
        candidatura.voluntario = voluntario;
        candidatura.status = StatusCandidatura.PENDENTE;
        return candidatura;
    }

    public boolean pendente() {
        return status == StatusCandidatura.PENDENTE;
    }

    /** decidido_em e decidido_por andam juntos com ACEITA/REJEITADA (ck_candidatura_decisao). */
    public void aceitar(Usuario autor) {
        decidir(StatusCandidatura.ACEITA, autor);
    }

    public void rejeitar(Usuario autor) {
        decidir(StatusCandidatura.REJEITADA, autor);
    }

    public void cancelar() {
        exigirPendente();
        this.status = StatusCandidatura.CANCELADA;
    }

    private void decidir(StatusCandidatura decisao, Usuario autor) {
        exigirPendente();
        this.status = decisao;
        this.decididoEm = Instant.now();
        this.decididoPor = autor;
    }

    private void exigirPendente() {
        if (!pendente()) {
            throw new IllegalStateException("Candidatura não está pendente: " + status);
        }
    }
}

package br.univille.voluntare.participacao.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.univille.voluntare.candidatura.entity.Candidatura;
import br.univille.voluntare.shared.util.UuidV7Generator;
import br.univille.voluntare.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Lugar confirmado do voluntário na vaga (tabela criada na V4). Nasce no aceite da candidatura.
 * Ocupa vaga em todo status menos CANCELADA.
 */
@Entity
@Table(name = "participacao")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participacao {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidatura_id", nullable = false, unique = true)
    private Candidatura candidatura;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusParticipacao status;

    @Column(name = "horas_realizadas", precision = 5, scale = 2)
    private BigDecimal horasRealizadas;

    @Column(name = "registrado_em")
    private Instant registradoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @Column(name = "cancelado_em")
    private Instant canceladoEm;

    public static Participacao confirmar(Candidatura candidatura) {
        Participacao participacao = new Participacao();
        participacao.candidatura = candidatura;
        participacao.status = StatusParticipacao.CONFIRMADA;
        return participacao;
    }

    public boolean confirmada() {
        return status == StatusParticipacao.CONFIRMADA;
    }

    /** Regras 4 e 5: só participação confirmada, e o registro é definitivo. Quem e quando ficam gravados. */
    public void registrarPresenca(BigDecimal horas, Usuario autor) {
        registrar(StatusParticipacao.PRESENTE, autor);
        this.horasRealizadas = horas;
    }

    public void registrarAusencia(Usuario autor) {
        registrar(StatusParticipacao.AUSENTE, autor);
    }

    private void registrar(StatusParticipacao resultado, Usuario autor) {
        if (!confirmada()) {
            throw new IllegalStateException("Participação não está confirmada: " + status);
        }
        this.status = resultado;
        this.registradoEm = Instant.now();
        this.registradoPor = autor;
    }

    /**
     * Regra 6: cancelar até o prazo antes do início devolve a vaga (CANCELADA);
     * depois disso a vaga não volta (CANCELADA_TARDIA).
     */
    public StatusParticipacao cancelar(Instant agora, Instant limiteParaDevolver) {
        if (!confirmada()) {
            throw new IllegalStateException("Participação não está confirmada: " + status);
        }
        this.status = agora.isAfter(limiteParaDevolver)
                ? StatusParticipacao.CANCELADA_TARDIA
                : StatusParticipacao.CANCELADA;
        this.canceladoEm = agora;
        return status;
    }
}

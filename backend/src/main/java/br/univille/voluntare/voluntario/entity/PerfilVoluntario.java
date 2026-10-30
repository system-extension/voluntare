package br.univille.voluntare.voluntario.entity;

import java.util.UUID;

import br.univille.voluntare.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
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

    public PerfilVoluntario(Usuario usuario, String telefone, String cidade) {
        this.usuario = usuario;
        this.telefone = telefone;
        this.cidade = cidade;
    }
}

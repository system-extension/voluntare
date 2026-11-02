package br.univille.voluntare.voluntario.entity;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import br.univille.voluntare.shared.util.UuidV7Generator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Catálogo de habilidades (tabela criada na V2). Serve ao perfil do voluntário e às habilidades desejadas
 * da vaga (V9). Sem administrador da plataforma, o catálogo muda por migração (D-24).
 */
@Entity
@Table(name = "habilidade")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Habilidade {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @Column(nullable = false, length = 80, unique = true)
    private String nome;
}

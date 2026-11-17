package br.univille.voluntare.parametro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** Parâmetro global (tabela criada na V6). Só leitura: muda por nova migração. */
@Entity
@Table(name = "parametro")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Parametro {

    @Id
    @Column(length = 60)
    private String chave;

    @Column(nullable = false, length = 200)
    private String valor;

    @Column(length = 300)
    private String descricao;
}

package br.univille.voluntare.shared.util;

import java.util.UUID;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.uuid.UuidValueGenerator;

/**
 * Liga o UuidV7 ao Hibernate: @UuidGenerator(algorithm = UuidV7Generator.class) no id da entidade.
 * O Hibernate 6.6 só traz v4 e v1 prontos; o 7 gera v7 sozinho e esta classe pode sair.
 */
public class UuidV7Generator implements UuidValueGenerator {

    @Override
    public UUID generateUuid(SharedSessionContractImplementor session) {
        return UuidV7.gerar();
    }
}

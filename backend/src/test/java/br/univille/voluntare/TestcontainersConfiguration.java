package br.univille.voluntare;

import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Sobe um PostgreSQL em contêiner para os testes.
 * O @ServiceConnection preenche o datasource sozinho; o Flyway roda as migrações nele.
 * Requer Docker em execução na máquina.
 *
 * Os testes usam só a carga de db/migration (V8 e V10), cujos números eles conferem.
 * Os dados extras de db/demo ficam de fora, para não mudar esses números.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgres() {
        return new PostgreSQLContainer<>("postgres:16-alpine");
    }

    @Bean
    FlywayConfigurationCustomizer somenteMigracoes() {
        return flyway -> flyway.locations("classpath:db/migration");
    }
}

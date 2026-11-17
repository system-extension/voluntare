package br.univille.voluntare;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class VoluntareApplicationTests {

    @Test
    void contextLoads() {
        // Sobe a aplicação com o banco real e aplica as migrações do Flyway.
    }

}

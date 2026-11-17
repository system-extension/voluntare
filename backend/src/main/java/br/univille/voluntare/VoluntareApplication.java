package br.univille.voluntare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class VoluntareApplication {

    public static void main(String[] args) {
        SpringApplication.run(VoluntareApplication.class, args);
    }

}

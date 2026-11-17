package br.univille.voluntare.shared.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * voluntare.jwt.* do application.yaml.
 * segredo: chave HS256, no mínimo 32 caracteres (256 bits). Em produção vem de JWT_SEGREDO.
 * validade: quanto tempo o token vale depois do login.
 */
@Validated
@ConfigurationProperties(prefix = "voluntare.jwt")
public record JwtProperties(
        @NotNull @Size(min = 32, message = "voluntare.jwt.segredo precisa de pelo menos 32 caracteres") String segredo,
        @NotNull Duration validade) {
}

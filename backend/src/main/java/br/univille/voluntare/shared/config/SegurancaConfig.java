package br.univille.voluntare.shared.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import br.univille.voluntare.shared.exception.ErroResponse;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Segurança da API: sem sessão no servidor, token JWT no header Authorization: Bearer.
 * O token é assinado e conferido pelo próprio Spring Security (OAuth2 Resource Server) com HS256.
 */
@Configuration
@EnableMethodSecurity
public class SegurancaConfig {

    /** Claim do token com o papel do usuário. Vira a autoridade ROLE_<papel> (ex.: ROLE_GESTOR). */
    public static final String CLAIM_PAPEL = "papel";
    public static final String CLAIM_ORGANIZACAO = "organizacaoId";

    @Bean
    SecurityFilterChain filtros(HttpSecurity http, ObjectMapper json) throws Exception {
        AuthenticationEntryPoint naoAutenticado = (request, response, e) ->
                escrever(response, json, 401, "Faça login para continuar.");
        AccessDeniedHandler semPermissao = (request, response, e) ->
                escrever(response, json, 403, "Você não tem permissão para esta ação.");

        http
                .csrf(AbstractHttpConfigurer::disable) // API sem cookie de sessão: CSRF não se aplica
                .cors(Customizer.withDefaults())       // usa o bean corsConfigurationSource() abaixo
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rotas -> rotas
                        // Busca pública e catálogo de habilidades
                        .requestMatchers(HttpMethod.GET, "/api/oportunidades", "/api/oportunidades/*", "/api/habilidades").permitAll()
                        // Entrar e se cadastrar
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/login", "/api/auth/cadastro", "/api/auth/cadastro-organizacao").permitAll()
                        // Documentação e página de erro padrão
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(rs -> rs
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(conversorDePapel()))
                        .authenticationEntryPoint(naoAutenticado)
                        .accessDeniedHandler(semPermissao))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(naoAutenticado)
                        .accessDeniedHandler(semPermissao));
        return http.build();
    }

    /**
     * CORS: só as origens do frontend chamam a API pelo navegador (voluntare.cors.origens).
     * Em desenvolvimento o Vite repassa /api para o Spring e nem precisa disto; vale quando o front
     * é servido de outro endereço.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${voluntare.cors.origens}") List<String> origens) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origens);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
        fonte.registerCorsConfiguration("/api/**", config);
        return fonte;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtEncoder jwtEncoder(JwtProperties props) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chave(props)));
    }

    @Bean
    JwtDecoder jwtDecoder(JwtProperties props) {
        return NimbusJwtDecoder.withSecretKey(chave(props)).macAlgorithm(MacAlgorithm.HS256).build();
    }

    private static SecretKey chave(JwtProperties props) {
        return new SecretKeySpec(props.segredo().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    private static JwtAuthenticationConverter conversorDePapel() {
        JwtGrantedAuthoritiesConverter papeis = new JwtGrantedAuthoritiesConverter();
        papeis.setAuthoritiesClaimName(CLAIM_PAPEL);
        papeis.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(papeis);
        return conversor;
    }

    /** 401 e 403 saem do filtro de segurança, antes do controller: escrevemos o JSON padrão aqui. */
    private static void escrever(HttpServletResponse response, ObjectMapper json, int status, String mensagem)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        json.writeValue(response.getOutputStream(), ErroResponse.de(status, mensagem));
    }
}

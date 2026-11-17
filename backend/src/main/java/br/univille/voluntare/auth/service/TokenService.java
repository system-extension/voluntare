package br.univille.voluntare.auth.service;

import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import br.univille.voluntare.shared.config.JwtProperties;
import br.univille.voluntare.shared.config.SegurancaConfig;
import br.univille.voluntare.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;

/**
 * Emite o JWT. O token leva só o necessário para autorizar sem ir ao banco:
 * sub (id do usuário), papel e organização. Nada de senha ou dado pessoal.
 */
@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtEncoder encoder;
    private final JwtProperties props;

    public record TokenEmitido(String valor, Instant expiraEm) {
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(props.validade());
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("voluntare")
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .subject(usuario.getId().toString())
                .claim(SegurancaConfig.CLAIM_PAPEL, usuario.getPapel().name());
        if (usuario.getOrganizacao() != null) {
            claims.claim(SegurancaConfig.CLAIM_ORGANIZACAO, usuario.getOrganizacao().getId().toString());
        }
        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        String valor = encoder.encode(JwtEncoderParameters.from(cabecalho, claims.build())).getTokenValue();
        return new TokenEmitido(valor, expiraEm);
    }
}

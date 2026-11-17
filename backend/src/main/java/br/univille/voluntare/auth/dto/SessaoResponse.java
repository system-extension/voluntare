package br.univille.voluntare.auth.dto;

import java.time.Instant;

/** Resposta do login e dos cadastros: o token para o header Authorization e quem entrou. */
public record SessaoResponse(String token, Instant expiraEm, UsuarioResponse usuario) {
}

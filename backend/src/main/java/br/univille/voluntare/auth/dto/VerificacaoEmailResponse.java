package br.univille.voluntare.auth.dto;

/**
 * Só diz se o e-mail já tem conta, para a tela seguir para a senha ou para o cadastro.
 * Não diz o papel nem se a conta está ativa: isso só depois da senha (D-25).
 */
public record VerificacaoEmailResponse(boolean existe) {
}

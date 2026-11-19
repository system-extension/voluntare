package br.univille.voluntare.organizacao.dto;

import java.util.UUID;

/** Quem assume as vagas em andamento da pessoa desativada. Só é obrigatório se ela tiver alguma (RN-15). */
public record DesativarMembroRequest(UUID novoResponsavelId) {
}

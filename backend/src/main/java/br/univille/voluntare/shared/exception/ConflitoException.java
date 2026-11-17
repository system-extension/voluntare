package br.univille.voluntare.shared.exception;

/** Vira 409. Conflito com o estado atual, como e-mail já cadastrado. A mensagem vai para a tela. */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}

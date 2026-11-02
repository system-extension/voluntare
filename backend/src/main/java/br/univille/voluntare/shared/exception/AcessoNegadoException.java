package br.univille.voluntare.shared.exception;

/** Vira 403. A pessoa está identificada, mas não pode fazer isto (ex.: conta desativada). A mensagem vai para a tela. */
public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}

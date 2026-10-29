package br.univille.voluntare.shared.exception;

/** Vira 404 no TratadorDeErros. A mensagem vai para a tela. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}

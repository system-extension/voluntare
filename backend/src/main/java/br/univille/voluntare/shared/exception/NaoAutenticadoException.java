package br.univille.voluntare.shared.exception;

/** Vira 401. Credenciais inválidas ou sessão que não vale mais. A mensagem vai para a tela. */
public class NaoAutenticadoException extends RuntimeException {

    public NaoAutenticadoException(String mensagem) {
        super(mensagem);
    }
}

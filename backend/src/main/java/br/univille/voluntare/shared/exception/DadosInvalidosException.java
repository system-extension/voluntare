package br.univille.voluntare.shared.exception;

import java.util.List;

import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;

/** Vira 400 com a lista de campos. Para regras que dependem de mais de um campo ou do estado do registro. */
public class DadosInvalidosException extends RuntimeException {

    private final transient List<CampoErro> campos;

    public DadosInvalidosException(List<CampoErro> campos) {
        super("Revise os campos indicados.");
        this.campos = List.copyOf(campos);
    }

    public List<CampoErro> getCampos() {
        return campos;
    }
}

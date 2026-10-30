package br.univille.voluntare.shared.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import lombok.extern.slf4j.Slf4j;

/** Converte as exceções no formato padrão de erro. Nenhum detalhe interno (stack trace, SQL) vai para o cliente. */
@Slf4j
@RestControllerAdvice
public class TratadorDeErros {

    private static final String VALOR_INVALIDO = "Valor inválido.";

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(RecursoNaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, ErroResponse.de(404, e.getMessage()));
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponse> conflito(ConflitoException e) {
        return resposta(HttpStatus.CONFLICT, ErroResponse.de(409, e.getMessage()));
    }

    @ExceptionHandler(NaoAutenticadoException.class)
    public ResponseEntity<ErroResponse> naoAutenticado(NaoAutenticadoException e) {
        return resposta(HttpStatus.UNAUTHORIZED, ErroResponse.de(401, e.getMessage()));
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AcessoNegadoException e) {
        return resposta(HttpStatus.FORBIDDEN, ErroResponse.de(403, e.getMessage()));
    }

    /** @PreAuthorize recusado dentro do controller. Sem este handler cairia no 500 do inesperado. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> semPermissao(AccessDeniedException e) {
        return resposta(HttpStatus.FORBIDDEN, ErroResponse.de(403, "Você não tem permissão para esta ação."));
    }

    /** JSON malformado ou com tipo errado no corpo da requisição. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> corpoInvalido(HttpMessageNotReadableException e) {
        return resposta(HttpStatus.BAD_REQUEST, ErroResponse.de(400, "Corpo da requisição inválido."));
    }

    /** Parâmetros ou corpo com @Valid que não passaram na validação, ou com tipo errado (pagina=abc). */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErroResponse> camposInvalidos(BindException e) {
        List<CampoErro> campos = e.getFieldErrors().stream()
                .map(erro -> new CampoErro(erro.getField(),
                        erro.isBindingFailure() ? VALOR_INVALIDO : erro.getDefaultMessage()))
                .toList();
        return resposta(HttpStatus.BAD_REQUEST,
                new ErroResponse(400, "Revise os campos indicados.", campos));
    }

    /** Variável de caminho com tipo errado, como /api/oportunidades/abc. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> tipoInvalido(MethodArgumentTypeMismatchException e) {
        return resposta(HttpStatus.BAD_REQUEST, new ErroResponse(400, "Revise os campos indicados.",
                List.of(new CampoErro(e.getName(), VALOR_INVALIDO))));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> inesperado(Exception e) {
        // Erros do próprio Spring MVC (rota inexistente, método não permitido...) mantêm o status deles.
        if (e instanceof org.springframework.web.ErrorResponse erroDoSpring) {
            HttpStatusCode status = erroDoSpring.getStatusCode();
            return ResponseEntity.status(status).body(ErroResponse.de(status.value(), mensagemPadrao(status)));
        }
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR,
                ErroResponse.de(500, "Não foi possível concluir a operação. Tente novamente."));
    }

    private static String mensagemPadrao(HttpStatusCode status) {
        return switch (status.value()) {
            case 404 -> "Recurso não encontrado.";
            case 405 -> "Método não permitido para este endereço.";
            default -> "Requisição inválida.";
        };
    }

    private static ResponseEntity<ErroResponse> resposta(HttpStatus status, ErroResponse corpo) {
        return ResponseEntity.status(status).body(corpo);
    }
}

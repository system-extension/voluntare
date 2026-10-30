package br.univille.voluntare.auth.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.univille.voluntare.auth.dto.CadastroOrganizacaoRequest;
import br.univille.voluntare.auth.dto.CadastroVoluntarioRequest;
import br.univille.voluntare.auth.dto.LoginRequest;
import br.univille.voluntare.auth.dto.SessaoResponse;
import br.univille.voluntare.auth.dto.UsuarioResponse;
import br.univille.voluntare.organizacao.entity.Organizacao;
import br.univille.voluntare.organizacao.repository.OrganizacaoRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.ConflitoException;
import br.univille.voluntare.shared.exception.NaoAutenticadoException;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.usuario.repository.UsuarioRepository;
import br.univille.voluntare.voluntario.entity.PerfilVoluntario;
import br.univille.voluntare.voluntario.repository.PerfilVoluntarioRepository;
import lombok.RequiredArgsConstructor;

/** Cadastro, login e "quem sou eu". Os dois cadastros já devolvem a sessão, sem pedir login de novo. */
@Service
@RequiredArgsConstructor
public class AuthService {

    // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails têm conta.
    private static final String CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";

    private final UsuarioRepository usuarios;
    private final OrganizacaoRepository organizacoes;
    private final PerfilVoluntarioRepository perfis;
    private final PasswordEncoder senhas;
    private final TokenService tokens;

    @Transactional
    public SessaoResponse cadastrarVoluntario(CadastroVoluntarioRequest dados) {
        String email = normalizarEmail(dados.email());
        exigirEmailLivre(email);
        Usuario voluntario = usuarios.save(
                Usuario.voluntario(dados.nome().trim(), email, senhas.encode(dados.senha())));
        perfis.save(new PerfilVoluntario(voluntario, vazioComoNulo(dados.telefone()), vazioComoNulo(dados.cidade())));
        return sessao(voluntario);
    }

    /** Organização e gestor na mesma transação: se um falhar, nenhum dos dois fica gravado. */
    @Transactional
    public SessaoResponse cadastrarOrganizacao(CadastroOrganizacaoRequest dados) {
        var org = dados.organizacao();
        var gestor = dados.gestor();
        String emailGestor = normalizarEmail(gestor.email());
        exigirEmailLivre(emailGestor);
        if (organizacoes.existsByNomeIgnoreCase(org.nome().trim())) {
            throw new ConflitoException("Já existe uma organização com esse nome.");
        }
        Organizacao organizacao = organizacoes.save(new Organizacao(
                org.nome().trim(),
                vazioComoNulo(org.descricao()),
                org.cidade().trim(),
                org.uf(),
                normalizarEmail(org.email()),
                vazioComoNulo(org.telefone())));
        Usuario novoGestor = usuarios.save(
                Usuario.gestor(organizacao, gestor.nome().trim(), emailGestor, senhas.encode(gestor.senha())));
        return sessao(novoGestor);
    }

    @Transactional(readOnly = true)
    public SessaoResponse entrar(LoginRequest dados) {
        Usuario usuario = usuarios.findByEmailIgnoreCase(dados.email().trim())
                .filter(u -> senhas.matches(dados.senha(), u.getSenhaHash()))
                .orElseThrow(() -> new NaoAutenticadoException(CREDENCIAIS_INVALIDAS));
        if (!usuario.podeAcessar()) {
            throw new AcessoNegadoException("Esta conta está desativada. Procure a sua organização.");
        }
        return sessao(usuario);
    }

    /** Lê do banco, não só do token: conta desativada depois do login perde o acesso aqui. */
    @Transactional(readOnly = true)
    public UsuarioResponse usuarioLogado(Long id) {
        return usuarios.findComOrganizacaoById(id)
                .filter(Usuario::podeAcessar)
                .map(UsuarioResponse::de)
                .orElseThrow(() -> new NaoAutenticadoException("Sessão inválida. Faça login de novo."));
    }

    private SessaoResponse sessao(Usuario usuario) {
        TokenService.TokenEmitido token = tokens.emitir(usuario);
        return new SessaoResponse(token.valor(), token.expiraEm(), UsuarioResponse.de(usuario));
    }

    private void exigirEmailLivre(String email) {
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw new ConflitoException("Já existe uma conta com esse e-mail.");
        }
    }

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String vazioComoNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}

package br.univille.voluntare.oportunidade.service;

import java.util.UUID;

import org.springframework.stereotype.Component;

import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.repository.OportunidadeRepository;
import br.univille.voluntare.shared.exception.AcessoNegadoException;
import br.univille.voluntare.shared.exception.RecursoNaoEncontradoException;
import br.univille.voluntare.usuario.entity.Papel;
import br.univille.voluntare.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;

/**
 * Regra de acesso às vagas da organização, usada pela gestão de vagas e pelas candidaturas:
 * - vaga de outra organização responde 404, para não revelar que ela existe;
 * - coordenador só opera as vagas pelas quais responde; gestor opera todas da organização.
 */
@Component
@RequiredArgsConstructor
public class AcessoOportunidade {

    private final OportunidadeRepository oportunidades;

    /** Gestor ou coordenador ativo. O controller já barra voluntário; aqui é a segunda trava. */
    public void exigirEquipe(Usuario autor) {
        if (autor.getOrganizacao() == null) {
            throw new AcessoNegadoException("Área exclusiva da equipe da organização.");
        }
    }

    public Oportunidade paraOperar(Usuario autor, UUID oportunidadeId) {
        exigirEquipe(autor);
        Oportunidade oportunidade = oportunidades.findComRelacoesById(oportunidadeId)
                .orElseThrow(RecursoNaoEncontradoException::oportunidade);
        exigirOperar(autor, oportunidade);
        return oportunidade;
    }

    /** Para quando a vaga já foi carregada de outro jeito (ex.: travada com FOR UPDATE). */
    public void exigirOperar(Usuario autor, Oportunidade oportunidade) {
        exigirEquipe(autor);
        if (!oportunidade.getOrganizacao().getId().equals(autor.getOrganizacao().getId())) {
            throw RecursoNaoEncontradoException.oportunidade();
        }
        boolean responde = oportunidade.getResponsavel().getId().equals(autor.getId());
        if (autor.getPapel() != Papel.GESTOR && !responde) {
            throw new AcessoNegadoException("Só o responsável pela vaga ou o gestor da organização podem alterá-la.");
        }
    }
}

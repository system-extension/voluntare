package br.univille.voluntare.oportunidade.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import br.univille.voluntare.oportunidade.dto.FiltroOportunidades;
import br.univille.voluntare.oportunidade.entity.Causa;
import br.univille.voluntare.oportunidade.entity.Oportunidade;
import br.univille.voluntare.oportunidade.entity.StatusOportunidade;
import br.univille.voluntare.shared.util.Textos;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

/** Monta o WHERE da busca pública a partir dos filtros informados. Filtro vazio não restringe nada. */
public final class OportunidadeSpecs {

    private static final char ESCAPE = '\\';

    private OportunidadeSpecs() {
    }

    public static Specification<Oportunidade> buscaPublica(FiltroOportunidades filtro) {
        return (root, query, cb) -> {
            List<Predicate> condicoes = new ArrayList<>();
            condicoes.add(cb.equal(root.get("status"), StatusOportunidade.ABERTA));

            if (Textos.temConteudo(filtro.texto())) {
                String padrao = Textos.padraoContendo(filtro.texto());
                List<Predicate> algumCampo = new ArrayList<>(List.of(
                        cb.like(semAcento(cb, root.get("titulo")), padrao, ESCAPE),
                        cb.like(semAcento(cb, root.get("descricao")), padrao, ESCAPE),
                        cb.like(semAcento(cb, root.get("organizacao").get("nome")), padrao, ESCAPE)));
                List<Causa> causas = Causa.comRotuloContendo(filtro.texto());
                if (!causas.isEmpty()) {
                    algumCampo.add(root.get("causa").in(causas));
                }
                condicoes.add(cb.or(algumCampo.toArray(Predicate[]::new)));
            }

            if (Textos.temConteudo(filtro.local())) {
                String padrao = Textos.padraoContendo(filtro.local());
                condicoes.add(cb.or(
                        cb.like(semAcento(cb, root.get("local")), padrao, ESCAPE),
                        cb.like(semAcento(cb, root.get("cidade")), padrao, ESCAPE),
                        cb.like(semAcento(cb, root.get("uf")), padrao, ESCAPE)));
            }

            if (filtro.causa() != null) {
                condicoes.add(cb.equal(root.get("causa"), filtro.causa()));
            }

            if (filtro.organizacaoId() != null) {
                condicoes.add(cb.equal(root.get("organizacao").get("id"), filtro.organizacaoId()));
            }

            return cb.and(condicoes.toArray(Predicate[]::new));
        };
    }

    /** Chama a função sem_acento() criada na V7. O lado do usuário é normalizado em Textos.semAcento. */
    private static Expression<String> semAcento(CriteriaBuilder cb, Expression<?> campo) {
        return cb.function("sem_acento", String.class, campo);
    }
}

package br.univille.voluntare.oportunidade.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import br.univille.voluntare.oportunidade.dto.OportunidadeRequest;
import br.univille.voluntare.organizacao.entity.Organizacao;
import br.univille.voluntare.shared.exception.ErroResponse.CampoErro;
import br.univille.voluntare.shared.util.UuidV7Generator;
import br.univille.voluntare.usuario.entity.Usuario;
import br.univille.voluntare.voluntario.entity.Habilidade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Oportunidade de voluntariado (tabela criada na V3).
 * Em RASCUNHO os campos do anúncio podem estar nulos (ck_oportunidade_completa).
 * As regras que dependem só da própria vaga (fluxo de status, campos obrigatórios, período) ficam aqui;
 * as que dependem de outras tabelas (quem pode alterar, vagas ocupadas) ficam no service.
 */
@Entity
@Table(name = "oportunidade")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Oportunidade {

    @Id
    @UuidGenerator(algorithm = UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizacao_id", nullable = false)
    private Organizacao organizacao;

    // No banco a FK é composta (organizacao_id, responsavel_id): o responsável é sempre da mesma organização.
    // Para o JPA basta a coluna responsavel_id; o banco recusa sozinho um responsável de outra organização.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private Usuario responsavel;

    @Column(nullable = false, length = 150)
    private String titulo;

    private String descricao;

    private String atividades;

    private String requisitos;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Causa causa;

    @Column(length = 200)
    private String local;

    @Column(length = 100)
    private String cidade;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 2)
    private String uf;

    private Instant inicio;

    private Instant fim;

    private Integer vagas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOportunidade status;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    /** Habilidades desejadas (V9). Ajudam o voluntário a se encontrar na vaga; não são requisito para candidatar-se. */
    @ManyToMany
    @JoinTable(name = "oportunidade_habilidade",
            joinColumns = @JoinColumn(name = "oportunidade_id"),
            inverseJoinColumns = @JoinColumn(name = "habilidade_id"))
    private Set<Habilidade> habilidades = new HashSet<>();

    public static Oportunidade nova(Organizacao organizacao, Usuario responsavel, StatusOportunidade status,
            OportunidadeRequest dados) {
        Oportunidade oportunidade = new Oportunidade();
        oportunidade.organizacao = organizacao;
        oportunidade.responsavel = responsavel;
        oportunidade.status = status;
        oportunidade.aplicar(dados);
        return oportunidade;
    }

    /** Copia os campos do anúncio. Organização, responsável e status mudam por métodos próprios. */
    public void aplicar(OportunidadeRequest dados) {
        this.titulo = dados.titulo().trim();
        this.descricao = limpo(dados.descricao());
        this.atividades = limpo(dados.atividades());
        this.requisitos = limpo(dados.requisitos());
        this.causa = dados.causa();
        this.local = limpo(dados.local());
        this.cidade = limpo(dados.cidade());
        this.uf = dados.uf();
        this.inicio = dados.inicio();
        this.fim = dados.fim();
        this.vagas = dados.vagas();
    }

    public void definirHabilidades(Set<Habilidade> novas) {
        habilidades.clear();
        habilidades.addAll(novas);
    }

    public void trocarResponsavel(Usuario novo) {
        this.responsavel = novo;
    }

    public boolean editavel() {
        return status == StatusOportunidade.RASCUNHO || status == StatusOportunidade.ABERTA;
    }

    /** Muda o status seguindo o fluxo. O service confere antes e devolve a mensagem certa para cada ação. */
    public void alterarStatus(StatusOportunidade novo) {
        if (!status.podeIrPara(novo)) {
            throw new IllegalStateException("Transição inválida: " + status + " → " + novo);
        }
        this.status = novo;
    }

    /**
     * O que falta para a vaga ficar ABERTA (mesmos campos do ck_oportunidade_completa).
     *
     * @param conferirInicio exige início no futuro. Na edição só vale quando o início mudou,
     *                       para não travar a edição de uma vaga que já começou.
     */
    public List<CampoErro> pendenciasParaAbrir(Instant agora, boolean conferirInicio) {
        List<CampoErro> pendencias = new ArrayList<>();
        if (descricao == null) {
            pendencias.add(new CampoErro("descricao", "Informe a descrição."));
        }
        if (causa == null) {
            pendencias.add(new CampoErro("causa", "Selecione a causa."));
        }
        if (local == null) {
            pendencias.add(new CampoErro("local", "Informe o endereço."));
        }
        if (cidade == null) {
            pendencias.add(new CampoErro("cidade", "Informe a cidade."));
        }
        if (uf == null) {
            pendencias.add(new CampoErro("uf", "Selecione o estado."));
        }
        if (inicio == null) {
            pendencias.add(new CampoErro("inicio", "Informe o início."));
        } else if (conferirInicio && !inicio.isAfter(agora)) {
            pendencias.add(new CampoErro("inicio", "O início precisa ser no futuro."));
        }
        if (fim == null) {
            pendencias.add(new CampoErro("fim", "Informe o término."));
        }
        if (vagas == null) {
            pendencias.add(new CampoErro("vagas", "Informe o número de vagas."));
        }
        pendencias.addAll(pendenciasDoPeriodo());
        return pendencias;
    }

    /** Vale em qualquer status, inclusive rascunho (ck_oportunidade_periodo). */
    public List<CampoErro> pendenciasDoPeriodo() {
        if (inicio != null && fim != null && !fim.isAfter(inicio)) {
            return List.of(new CampoErro("fim", "O término precisa ser depois do início."));
        }
        return List.of();
    }

    private static String limpo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}

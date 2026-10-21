-- V1: schema inicial do Voluntare, a partir de docs/der/der.md.
-- Regras que o banco não consegue garantir sozinho ficam nos services (ver "Regras validadas no service" no DER).
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

-- =========================================================
-- Usuários e perfil
-- =========================================================

CREATE TABLE usuario (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    email       VARCHAR(160) NOT NULL,
    senha_hash  VARCHAR(100) NOT NULL,
    papel       VARCHAR(20)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('VOLUNTARIO', 'COORDENADOR', 'ADMINISTRADOR'))
);

-- E-mail único sem diferenciar maiúsculas
CREATE UNIQUE INDEX ux_usuario_email ON usuario (lower(email));

CREATE TABLE perfil_voluntario (
    usuario_id      BIGINT PRIMARY KEY,
    telefone        VARCHAR(20),
    cidade          VARCHAR(100),
    disponibilidade TEXT,
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT
);

-- =========================================================
-- Habilidades
-- =========================================================

CREATE TABLE habilidade (
    id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome  VARCHAR(80) NOT NULL,
    CONSTRAINT uk_habilidade_nome UNIQUE (nome)
);

CREATE TABLE voluntario_habilidade (
    voluntario_id  BIGINT      NOT NULL,
    habilidade_id  BIGINT      NOT NULL,
    tipo           VARCHAR(20) NOT NULL,
    CONSTRAINT pk_voluntario_habilidade PRIMARY KEY (voluntario_id, habilidade_id),
    CONSTRAINT fk_vh_voluntario FOREIGN KEY (voluntario_id) REFERENCES perfil_voluntario (usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_vh_habilidade FOREIGN KEY (habilidade_id) REFERENCES habilidade (id) ON DELETE RESTRICT,
    CONSTRAINT ck_vh_tipo CHECK (tipo IN ('HABILIDADE', 'INTERESSE'))
);

CREATE INDEX ix_vh_habilidade ON voluntario_habilidade (habilidade_id);

-- =========================================================
-- Oportunidades
-- =========================================================

CREATE TABLE oportunidade (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    coordenador_id  BIGINT       NOT NULL,
    titulo          VARCHAR(150) NOT NULL,
    descricao       TEXT         NOT NULL,
    local           VARCHAR(200) NOT NULL,
    cidade          VARCHAR(100) NOT NULL,
    uf              CHAR(2)      NOT NULL,
    inicio          TIMESTAMPTZ  NOT NULL,
    fim             TIMESTAMPTZ  NOT NULL,
    vagas           INTEGER      NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ABERTA',
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_oportunidade_coordenador FOREIGN KEY (coordenador_id) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT ck_oportunidade_uf CHECK (uf ~ '^[A-Z]{2}$'),
    CONSTRAINT ck_oportunidade_periodo CHECK (fim > inicio),
    CONSTRAINT ck_oportunidade_vagas CHECK (vagas > 0),
    CONSTRAINT ck_oportunidade_status CHECK (status IN ('ABERTA', 'ENCERRADA', 'CANCELADA'))
);

CREATE INDEX ix_oportunidade_coordenador ON oportunidade (coordenador_id);
CREATE INDEX ix_oportunidade_status_inicio ON oportunidade (status, inicio);

CREATE TABLE oportunidade_habilidade (
    oportunidade_id  BIGINT NOT NULL,
    habilidade_id    BIGINT NOT NULL,
    CONSTRAINT pk_oportunidade_habilidade PRIMARY KEY (oportunidade_id, habilidade_id),
    CONSTRAINT fk_oh_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidade (id) ON DELETE RESTRICT,
    CONSTRAINT fk_oh_habilidade FOREIGN KEY (habilidade_id) REFERENCES habilidade (id) ON DELETE RESTRICT
);

CREATE INDEX ix_oh_habilidade ON oportunidade_habilidade (habilidade_id);

-- =========================================================
-- Candidaturas
-- =========================================================

CREATE TABLE candidatura (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    oportunidade_id  BIGINT      NOT NULL,
    voluntario_id    BIGINT      NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    decidido_em      TIMESTAMPTZ,
    decidido_por     BIGINT,
    CONSTRAINT fk_candidatura_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidade (id) ON DELETE RESTRICT,
    CONSTRAINT fk_candidatura_voluntario FOREIGN KEY (voluntario_id) REFERENCES perfil_voluntario (usuario_id) ON DELETE RESTRICT,
    CONSTRAINT fk_candidatura_decidido_por FOREIGN KEY (decidido_por) REFERENCES usuario (id) ON DELETE RESTRICT,
    -- Regra 1: sem candidatura duplicada
    CONSTRAINT uk_candidatura_oportunidade_voluntario UNIQUE (oportunidade_id, voluntario_id),
    CONSTRAINT ck_candidatura_status CHECK (status IN ('PENDENTE', 'ACEITA', 'REJEITADA', 'CANCELADA')),
    -- decidido_em/decidido_por preenchidos só em ACEITA ou REJEITADA
    CONSTRAINT ck_candidatura_decisao CHECK (
        (status IN ('ACEITA', 'REJEITADA') AND decidido_em IS NOT NULL AND decidido_por IS NOT NULL)
        OR
        (status IN ('PENDENTE', 'CANCELADA') AND decidido_em IS NULL AND decidido_por IS NULL)
    )
);

-- O lado oportunidade_id já é coberto pelo índice único
CREATE INDEX ix_candidatura_voluntario ON candidatura (voluntario_id);
CREATE INDEX ix_candidatura_decidido_por ON candidatura (decidido_por);

-- =========================================================
-- Participações
-- =========================================================

CREATE TABLE participacao (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidatura_id    BIGINT       NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMADA',
    horas_realizadas  NUMERIC(5,2),
    registrado_em     TIMESTAMPTZ,
    registrado_por    BIGINT,
    cancelado_em      TIMESTAMPTZ,
    CONSTRAINT fk_participacao_candidatura FOREIGN KEY (candidatura_id) REFERENCES candidatura (id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacao_registrado_por FOREIGN KEY (registrado_por) REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT uk_participacao_candidatura UNIQUE (candidatura_id),
    CONSTRAINT ck_participacao_status CHECK (status IN ('CONFIRMADA', 'PRESENTE', 'AUSENTE', 'CANCELADA', 'CANCELADA_TARDIA')),
    -- Regra 5: horas nulas ou maiores que zero, obrigatórias em PRESENTE
    CONSTRAINT ck_participacao_horas_positivas CHECK (horas_realizadas IS NULL OR horas_realizadas > 0),
    CONSTRAINT ck_participacao_horas_presente CHECK (status <> 'PRESENTE' OR horas_realizadas IS NOT NULL),
    -- registrado_em/registrado_por só em PRESENTE ou AUSENTE
    CONSTRAINT ck_participacao_registro CHECK (
        (status IN ('PRESENTE', 'AUSENTE') AND registrado_em IS NOT NULL AND registrado_por IS NOT NULL)
        OR
        (status NOT IN ('PRESENTE', 'AUSENTE') AND registrado_em IS NULL AND registrado_por IS NULL)
    ),
    -- cancelado_em só em CANCELADA ou CANCELADA_TARDIA
    CONSTRAINT ck_participacao_cancelamento CHECK (
        (status IN ('CANCELADA', 'CANCELADA_TARDIA')) = (cancelado_em IS NOT NULL)
    )
);

CREATE INDEX ix_participacao_registrado_por ON participacao (registrado_por);

-- =========================================================
-- Histórico de status
-- =========================================================

CREATE TABLE historico_status (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    oportunidade_id  BIGINT,
    candidatura_id   BIGINT,
    participacao_id  BIGINT,
    status_anterior  VARCHAR(20),
    status_novo      VARCHAR(20)  NOT NULL,
    alterado_por     BIGINT       NOT NULL,
    alterado_em      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    observacao       VARCHAR(500),
    CONSTRAINT fk_hist_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidade (id) ON DELETE RESTRICT,
    CONSTRAINT fk_hist_candidatura FOREIGN KEY (candidatura_id) REFERENCES candidatura (id) ON DELETE RESTRICT,
    CONSTRAINT fk_hist_participacao FOREIGN KEY (participacao_id) REFERENCES participacao (id) ON DELETE RESTRICT,
    CONSTRAINT fk_hist_alterado_por FOREIGN KEY (alterado_por) REFERENCES usuario (id) ON DELETE RESTRICT,
    -- Cada linha pertence a exatamente uma entidade
    CONSTRAINT ck_hist_uma_entidade CHECK (num_nonnulls(oportunidade_id, candidatura_id, participacao_id) = 1)
);

CREATE INDEX ix_hist_oportunidade ON historico_status (oportunidade_id) WHERE oportunidade_id IS NOT NULL;
CREATE INDEX ix_hist_candidatura ON historico_status (candidatura_id) WHERE candidatura_id IS NOT NULL;
CREATE INDEX ix_hist_participacao ON historico_status (participacao_id) WHERE participacao_id IS NOT NULL;
CREATE INDEX ix_hist_alterado_por ON historico_status (alterado_por);

-- =========================================================
-- Parâmetros
-- =========================================================

CREATE TABLE parametro (
    chave      VARCHAR(60)  PRIMARY KEY,
    valor      VARCHAR(200) NOT NULL,
    descricao  VARCHAR(300)
);

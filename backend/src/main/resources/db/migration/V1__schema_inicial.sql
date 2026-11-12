-- V1: schema inicial do Voluntare, a partir de docs/der/der.md.
-- Regras que o banco não consegue garantir sozinho ficam nos services (ver "Regras validadas no service" no DER).
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

-- =========================================================
-- Organizações
-- =========================================================

-- A ONG se autocadastra: a organização e o seu gestor nascem na mesma transação
CREATE TABLE organizacao (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    descricao  TEXT,
    cidade     VARCHAR(100) NOT NULL,
    uf         CHAR(2)      NOT NULL,
    email      VARCHAR(160) NOT NULL,
    telefone   VARCHAR(20),
    ativa      BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT ck_organizacao_uf CHECK (uf ~ '^[A-Z]{2}$')
);

-- Nome único sem diferenciar maiúsculas
CREATE UNIQUE INDEX ux_organizacao_nome ON organizacao (lower(nome));

-- =========================================================
-- Usuários e perfil
-- =========================================================

CREATE TABLE usuario (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizacao_id  BIGINT,
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL,
    senha_hash      VARCHAR(100) NOT NULL,
    papel           VARCHAR(20)  NOT NULL,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_usuario_organizacao FOREIGN KEY (organizacao_id) REFERENCES organizacao (id) ON DELETE RESTRICT,
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('VOLUNTARIO', 'COORDENADOR', 'GESTOR')),
    -- Gestor e coordenador pertencem a uma organização; voluntário não
    CONSTRAINT ck_usuario_organizacao CHECK ((papel = 'VOLUNTARIO') = (organizacao_id IS NULL)),
    -- Alvo da FK composta do responsável da oportunidade. Também serve para listar a equipe de uma organização
    CONSTRAINT uk_usuario_organizacao_id UNIQUE (organizacao_id, id)
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
-- Habilidades do voluntário
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

-- Toda oportunidade é presencial. É classificada por causa, não por habilidade.
-- Rascunho pode ser salvo incompleto; os demais campos passam a ser obrigatórios ao publicar.
CREATE TABLE oportunidade (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizacao_id  BIGINT       NOT NULL,
    responsavel_id  BIGINT       NOT NULL,
    titulo          VARCHAR(150) NOT NULL,
    descricao       TEXT,
    atividades      TEXT,
    requisitos      TEXT,
    causa           VARCHAR(30),
    local           VARCHAR(200),
    cidade          VARCHAR(100),
    uf              CHAR(2),
    inicio          TIMESTAMPTZ,
    fim             TIMESTAMPTZ,
    vagas           INTEGER,
    status          VARCHAR(20)  NOT NULL DEFAULT 'RASCUNHO',
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_oportunidade_organizacao FOREIGN KEY (organizacao_id) REFERENCES organizacao (id) ON DELETE RESTRICT,
    -- O responsável é gestor ou coordenador da mesma organização da vaga.
    -- Voluntário não tem organizacao_id, então nunca casa com esta FK.
    CONSTRAINT fk_oportunidade_responsavel FOREIGN KEY (organizacao_id, responsavel_id)
        REFERENCES usuario (organizacao_id, id) ON DELETE RESTRICT,
    CONSTRAINT ck_oportunidade_causa CHECK (causa IN ('EDUCACAO', 'MEIO_AMBIENTE', 'ASSISTENCIA_SOCIAL', 'ANIMAIS', 'COMUNICACAO')),
    CONSTRAINT ck_oportunidade_uf CHECK (uf ~ '^[A-Z]{2}$'),
    CONSTRAINT ck_oportunidade_periodo CHECK (fim > inicio),
    CONSTRAINT ck_oportunidade_vagas CHECK (vagas BETWEEN 1 AND 999),
    CONSTRAINT ck_oportunidade_status CHECK (status IN ('RASCUNHO', 'ABERTA', 'ENCERRADA', 'CANCELADA')),
    -- Só rascunho e rascunho descartado (CANCELADA) podem ficar incompletos
    CONSTRAINT ck_oportunidade_completa CHECK (
        status IN ('RASCUNHO', 'CANCELADA')
        OR num_nulls(descricao, causa, local, cidade, uf, inicio, fim, vagas) = 0
    )
);

CREATE INDEX ix_oportunidade_organizacao_status ON oportunidade (organizacao_id, status);
CREATE INDEX ix_oportunidade_responsavel ON oportunidade (responsavel_id);
CREATE INDEX ix_oportunidade_status_inicio ON oportunidade (status, inicio);

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
    CONSTRAINT ck_hist_uma_entidade CHECK (num_nonnulls(oportunidade_id, candidatura_id, participacao_id) = 1),
    -- Toda linha registra uma mudança de fato (na criação, status_anterior é nulo)
    CONSTRAINT ck_hist_mudanca CHECK (status_anterior IS DISTINCT FROM status_novo)
);

CREATE INDEX ix_hist_oportunidade ON historico_status (oportunidade_id) WHERE oportunidade_id IS NOT NULL;
CREATE INDEX ix_hist_candidatura ON historico_status (candidatura_id) WHERE candidatura_id IS NOT NULL;
CREATE INDEX ix_hist_participacao ON historico_status (participacao_id) WHERE participacao_id IS NOT NULL;
CREATE INDEX ix_hist_alterado_por ON historico_status (alterado_por);

-- Uma única linha de criação (status_anterior nulo) por entidade. Ela também diz quem criou o registro.
CREATE UNIQUE INDEX ux_hist_criacao_oportunidade ON historico_status (oportunidade_id)
    WHERE status_anterior IS NULL AND oportunidade_id IS NOT NULL;
CREATE UNIQUE INDEX ux_hist_criacao_candidatura ON historico_status (candidatura_id)
    WHERE status_anterior IS NULL AND candidatura_id IS NOT NULL;
CREATE UNIQUE INDEX ux_hist_criacao_participacao ON historico_status (participacao_id)
    WHERE status_anterior IS NULL AND participacao_id IS NOT NULL;

-- =========================================================
-- Parâmetros
-- =========================================================

-- Parâmetros globais do sistema. Sem administrador da plataforma, mudam só por nova migração.
CREATE TABLE parametro (
    chave      VARCHAR(60)  PRIMARY KEY,
    valor      VARCHAR(200) NOT NULL,
    descricao  VARCHAR(300)
);

INSERT INTO parametro (chave, valor, descricao) VALUES
    ('prazo_devolucao_vaga_horas', '48',
     'Horas antes do início da oportunidade até quando o cancelamento do voluntário devolve a vaga (regra 6)');

-- V3: oportunidades de voluntariado
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

-- =========================================================
-- Oportunidades
-- =========================================================

-- Toda oportunidade é presencial. É classificada por causa, não por habilidade.
-- Rascunho pode ser salvo incompleto; os demais campos passam a ser obrigatórios ao publicar.
CREATE TABLE oportunidade (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacao_id  UUID         NOT NULL,
    responsavel_id  UUID         NOT NULL,
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

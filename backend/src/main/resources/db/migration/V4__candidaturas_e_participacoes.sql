-- V4: candidaturas e participações
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

-- =========================================================
-- Candidaturas
-- =========================================================

CREATE TABLE candidatura (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_id  UUID        NOT NULL,
    voluntario_id    UUID        NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    decidido_em      TIMESTAMPTZ,
    decidido_por     UUID,
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
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidatura_id    UUID         NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMADA',
    horas_realizadas  NUMERIC(5,2),
    registrado_em     TIMESTAMPTZ,
    registrado_por    UUID,
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

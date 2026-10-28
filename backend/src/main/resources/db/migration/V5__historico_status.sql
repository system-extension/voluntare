-- V5: histórico de mudanças de status
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

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

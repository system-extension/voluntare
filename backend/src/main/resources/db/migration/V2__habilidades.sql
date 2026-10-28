-- V2: catálogo de habilidades e habilidades/interesses do voluntário
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

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

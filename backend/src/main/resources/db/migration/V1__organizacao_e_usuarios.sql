-- V1: organizações, usuários e perfil do voluntário
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

-- =========================================================
-- Organizações
-- =========================================================

-- A ONG se autocadastra: a organização e o seu gestor nascem na mesma transação
CREATE TABLE organizacao (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacao_id  UUID,
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
    usuario_id      UUID PRIMARY KEY,
    telefone        VARCHAR(20),
    cidade          VARCHAR(100),
    disponibilidade TEXT,
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE RESTRICT
);

-- V9: habilidades desejadas na oportunidade (briefing, MVP: "habilidades desejadas"; D-24)
-- A vaga continua classificada por causa; as habilidades dizem o que ajuda a fazer a atividade.
-- O catálogo é o mesmo do perfil do voluntário (tabela habilidade, V2).

CREATE TABLE oportunidade_habilidade (
    oportunidade_id  UUID NOT NULL,
    habilidade_id    UUID NOT NULL,
    CONSTRAINT pk_oportunidade_habilidade PRIMARY KEY (oportunidade_id, habilidade_id),
    CONSTRAINT fk_oh_oportunidade FOREIGN KEY (oportunidade_id) REFERENCES oportunidade (id) ON DELETE RESTRICT,
    CONSTRAINT fk_oh_habilidade FOREIGN KEY (habilidade_id) REFERENCES habilidade (id) ON DELETE RESTRICT
);

-- O lado oportunidade_id já é coberto pela chave primária
CREATE INDEX ix_oh_habilidade ON oportunidade_habilidade (habilidade_id);

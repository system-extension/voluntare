-- V6: parâmetros do sistema
-- Parte do schema inicial do Voluntare (docs/der/der.md). Regras que o banco não garante ficam nos services.
-- Nenhuma exclusão física: todas as FKs usam ON DELETE RESTRICT.

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

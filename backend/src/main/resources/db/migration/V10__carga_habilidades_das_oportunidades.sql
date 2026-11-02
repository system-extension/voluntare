-- V10: massa de demonstração (complemento da V8). Habilidades desejadas das 8 vagas de exemplo.
-- Mesmos ids fixos da V8 (D-21): 3 = habilidade, 4 = oportunidade.

CREATE FUNCTION pg_temp.id(tabela INTEGER, n INTEGER) RETURNS UUID
    LANGUAGE sql IMMUTABLE
    AS $$ SELECT (tabela::text || '0000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid $$;

-- Habilidades: 1 Ensino e reforço escolar · 2 Recreação infantil · 3 Organização de eventos · 4 Cuidado com animais
-- 5 Fotografia · 6 Comunicação e redes sociais · 7 Primeiros socorros · 8 Cozinha · 9 Idiomas · 10 Educação ambiental
INSERT INTO oportunidade_habilidade (oportunidade_id, habilidade_id) VALUES
    (pg_temp.id(4, 1), pg_temp.id(3, 1)),                                        -- Apoio escolar
    (pg_temp.id(4, 2), pg_temp.id(3, 10)), (pg_temp.id(4, 2), pg_temp.id(3, 2)),  -- Educação ambiental
    (pg_temp.id(4, 3), pg_temp.id(3, 3)),                                        -- Eventos beneficentes
    (pg_temp.id(4, 4), pg_temp.id(3, 2)),                                        -- Oficinas de arte (rascunho)
    (pg_temp.id(4, 5), pg_temp.id(3, 2)), (pg_temp.id(4, 5), pg_temp.id(3, 7)),   -- Recreação infantil
    (pg_temp.id(4, 6), pg_temp.id(3, 4)),                                        -- Passeios com cães
    (pg_temp.id(4, 7), pg_temp.id(3, 4)), (pg_temp.id(4, 7), pg_temp.id(3, 3)),   -- Feira de adoção
    (pg_temp.id(4, 8), pg_temp.id(3, 5)), (pg_temp.id(4, 8), pg_temp.id(3, 6));   -- Fotografia

DROP FUNCTION pg_temp.id(INTEGER, INTEGER);

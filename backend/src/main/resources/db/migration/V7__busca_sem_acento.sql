-- V7: busca sem diferenciar acentos nem maiúsculas ("educacao" encontra "Educação").
-- unaccent é uma extensão confiável do PostgreSQL (13+): o dono do banco pode habilitá-la sem superusuário.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() é STABLE porque depende do dicionário configurado. Fixando o dicionário, a função
-- pode ser IMMUTABLE, o que permite usá-la em índices no futuro. É a forma recomendada pela documentação.
-- Os services chamam sem_acento() nas duas pontas da comparação (coluna e texto buscado).
CREATE FUNCTION sem_acento(texto TEXT) RETURNS TEXT
    LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
    AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, lower(texto)) $$;

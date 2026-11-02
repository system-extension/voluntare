-- V8: massa de demonstração (issue #14). Dados fictícios.
-- Senha de todos os usuários: Voluntare@2026 (BCrypt, custo 10).
-- As datas são relativas ao dia em que a migração roda, para que vagas futuras e encerradas façam sentido na demonstração.
-- Todas as linhas respeitam as regras do service: responsável da mesma organização, vagas não excedidas,
-- presença só depois do fim, horas dentro da duração e uma linha de criação no histórico por registro.

-- Ids fixos e legíveis (D-21): o 1º dígito diz a tabela e o último bloco, o número do registro.
-- 1 organização · 2 usuário · 3 habilidade · 4 oportunidade · 5 candidatura · 6 participação
-- Ex.: a oportunidade 1 é 40000000-0000-0000-0000-000000000001. Os registros novos recebem UUID v7 do backend.
CREATE FUNCTION pg_temp.id(tabela INTEGER, n INTEGER) RETURNS UUID
    LANGUAGE sql IMMUTABLE
    AS $$ SELECT (tabela::text || '0000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid $$;

-- Data e hora no fuso de Joinville, a d dias de hoje
CREATE FUNCTION pg_temp.em(d INTEGER, hora TIME) RETURNS TIMESTAMPTZ
    LANGUAGE sql STABLE
    AS $$ SELECT (((now() AT TIME ZONE 'America/Sao_Paulo')::date + d) + hora) AT TIME ZONE 'America/Sao_Paulo' $$;

-- =========================================================
-- Organizações e equipes
-- =========================================================

INSERT INTO organizacao (id, nome, descricao, cidade, uf, email, telefone, criado_em) VALUES
    (pg_temp.id(1, 1), 'Instituto Novos Caminhos', 'Reforço escolar, cultura e assistência para famílias da zona sul.',
        'Joinville', 'SC', 'contato@novoscaminhos.example.org', '(47) 3333-1000', pg_temp.em(-60, '09:00')),
    (pg_temp.id(1, 2), 'Associação Patas Amigas', 'Acolhimento e adoção responsável de cães e gatos.',
        'São Paulo', 'SP', 'contato@patasamigas.example.org', '(11) 4000-2000', pg_temp.em(-45, '09:00'));

INSERT INTO usuario (id, organizacao_id, nome, email, senha_hash, papel, ativo, criado_em) VALUES
    -- Instituto Novos Caminhos
    (pg_temp.id(2, 1),  pg_temp.id(1, 1),    'Ana Ribeiro',     'ana@novoscaminhos.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'GESTOR',      TRUE,  pg_temp.em(-60, '09:00')),
    (pg_temp.id(2, 2),  pg_temp.id(1, 1),    'Bruno Costa',     'bruno@novoscaminhos.example.org',  '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-58, '10:00')),
    (pg_temp.id(2, 3),  pg_temp.id(1, 1),    'Carla Mendes',    'carla@novoscaminhos.example.org',  '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-58, '10:30')),
    -- Associação Patas Amigas
    (pg_temp.id(2, 4),  pg_temp.id(1, 2),    'Diego Souza',     'diego@patasamigas.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'GESTOR',      TRUE,  pg_temp.em(-45, '09:00')),
    (pg_temp.id(2, 5),  pg_temp.id(1, 2),    'Elisa Martins',   'elisa@patasamigas.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-44, '09:00')),
    (pg_temp.id(2, 12), pg_temp.id(1, 2),    'Marcos Teixeira', 'marcos@patasamigas.example.org',   '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', FALSE, pg_temp.em(-44, '09:30')),
    -- Voluntários
    (pg_temp.id(2, 6),  NULL, 'Fernanda Lima',   'fernanda@example.com',             '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-50, '20:00')),
    (pg_temp.id(2, 7),  NULL, 'Gustavo Alves',   'gustavo@example.com',              '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-48, '19:00')),
    (pg_temp.id(2, 8),  NULL, 'Helena Rocha',    'helena@example.com',               '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-40, '18:00')),
    (pg_temp.id(2, 9),  NULL, 'Igor Santos',     'igor@example.com',                 '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-40, '21:00')),
    (pg_temp.id(2, 10), NULL, 'Julia Ferreira',  'julia@example.com',                '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-35, '12:00')),
    (pg_temp.id(2, 11), NULL, 'Lucas Pereira',   'lucas@example.com',                '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-30, '08:00'));

INSERT INTO perfil_voluntario (usuario_id, telefone, cidade, disponibilidade) VALUES
    (pg_temp.id(2, 6),  '(47) 99999-0006', 'Joinville', 'Fins de semana e terças à tarde'),
    (pg_temp.id(2, 7),  '(47) 99999-0007', 'Joinville', 'Sábados'),
    (pg_temp.id(2, 8),  '(47) 99999-0008', 'Joinville', 'Manhãs durante a semana'),
    (pg_temp.id(2, 9),  '(47) 99999-0009', 'Joinville', 'Noites e fins de semana'),
    (pg_temp.id(2, 10), '(11) 99999-0010', 'São Paulo', 'Horário flexível'),
    (pg_temp.id(2, 11), '(11) 99999-0011', 'São Paulo', 'Fins de semana');

-- =========================================================
-- Habilidades do voluntário
-- =========================================================

INSERT INTO habilidade (id, nome) VALUES
    (pg_temp.id(3, 1), 'Ensino e reforço escolar'),
    (pg_temp.id(3, 2), 'Recreação infantil'),
    (pg_temp.id(3, 3), 'Organização de eventos'),
    (pg_temp.id(3, 4), 'Cuidado com animais'),
    (pg_temp.id(3, 5), 'Fotografia'),
    (pg_temp.id(3, 6), 'Comunicação e redes sociais'),
    (pg_temp.id(3, 7), 'Primeiros socorros'),
    (pg_temp.id(3, 8), 'Cozinha'),
    (pg_temp.id(3, 9), 'Idiomas'),
    (pg_temp.id(3, 10), 'Educação ambiental');

INSERT INTO voluntario_habilidade (voluntario_id, habilidade_id, tipo) VALUES
    (pg_temp.id(2, 6), pg_temp.id(3, 1), 'HABILIDADE'), (pg_temp.id(2, 6), pg_temp.id(3, 10), 'HABILIDADE'), (pg_temp.id(2, 6), pg_temp.id(3, 2), 'INTERESSE'),
    (pg_temp.id(2, 7), pg_temp.id(3, 3), 'HABILIDADE'), (pg_temp.id(2, 7), pg_temp.id(3, 8), 'HABILIDADE'), (pg_temp.id(2, 7), pg_temp.id(3, 1), 'INTERESSE'),
    (pg_temp.id(2, 8), pg_temp.id(3, 7), 'HABILIDADE'), (pg_temp.id(2, 8), pg_temp.id(3, 2), 'INTERESSE'),
    (pg_temp.id(2, 9), pg_temp.id(3, 3), 'HABILIDADE'), (pg_temp.id(2, 9), pg_temp.id(3, 9), 'INTERESSE'),
    (pg_temp.id(2, 10), pg_temp.id(3, 4), 'HABILIDADE'), (pg_temp.id(2, 10), pg_temp.id(3, 5), 'HABILIDADE'), (pg_temp.id(2, 10), pg_temp.id(3, 6), 'INTERESSE'),
    (pg_temp.id(2, 11), pg_temp.id(3, 4), 'HABILIDADE'), (pg_temp.id(2, 11), pg_temp.id(3, 10), 'INTERESSE');

-- =========================================================
-- Oportunidades
-- =========================================================
-- 1 aberta com vaga · 2 aberta e preenchida · 3 encerrada com presença registrada · 4 rascunho incompleto
-- 5 cancelada · 6 aberta (outra ONG) · 7 encerrada (outra ONG) · 8 publicada a partir de rascunho

INSERT INTO oportunidade (id, organizacao_id, responsavel_id, titulo, descricao, atividades, requisitos, causa,
                          local, cidade, uf, inicio, fim, vagas, status, criado_em) VALUES
    (pg_temp.id(4, 1), pg_temp.id(1, 1), pg_temp.id(2, 2), 'Apoio escolar para crianças',
        'Apoie crianças do ensino fundamental no desenvolvimento da leitura, da escrita e da matemática em encontros de reforço escolar.',
        'Acompanhar pequenos grupos nas tarefas e propor atividades de leitura.',
        'Paciência, pontualidade e gosto por ensinar.',
        'EDUCACAO', 'Rua XV de Novembro, 1200 - Centro', 'Joinville', 'SC',
        pg_temp.em(10, '14:00'), pg_temp.em(10, '18:00'), 3, 'ABERTA', pg_temp.em(-6, '09:00')),
    (pg_temp.id(4, 2), pg_temp.id(1, 1), pg_temp.id(2, 3), 'Educação ambiental nas escolas',
        'Participe de oficinas sobre reciclagem, consumo consciente e cuidado com a natureza em uma escola municipal.',
        'Conduzir dinâmicas com turmas do 5º ano e apoiar a montagem da horta.',
        NULL,
        'MEIO_AMBIENTE', 'Escola Municipal Rui Barbosa - Rua Blumenau, 455', 'Joinville', 'SC',
        pg_temp.em(5, '08:30'), pg_temp.em(5, '11:30'), 2, 'ABERTA', pg_temp.em(-8, '09:00')),
    (pg_temp.id(4, 3), pg_temp.id(1, 1), pg_temp.id(2, 2), 'Apoio em eventos beneficentes',
        'Colabore na recepção, organização e orientação de visitantes no bazar beneficente anual do instituto.',
        'Recepção, organização das mesas e apoio no caixa.',
        'Disponibilidade durante toda a manhã.',
        'ASSISTENCIA_SOCIAL', 'Salão comunitário - Rua Ottokar Doerffel, 300', 'Joinville', 'SC',
        pg_temp.em(-20, '09:00'), pg_temp.em(-20, '13:00'), 4, 'ENCERRADA', pg_temp.em(-40, '09:00')),
    (pg_temp.id(4, 4), pg_temp.id(1, 1), pg_temp.id(2, 1), 'Oficinas de arte e cultura',
        NULL, NULL, NULL,
        'EDUCACAO', NULL, 'Joinville', 'SC',
        NULL, NULL, NULL, 'RASCUNHO', pg_temp.em(-1, '16:00')),
    (pg_temp.id(4, 5), pg_temp.id(1, 1), pg_temp.id(2, 3), 'Recreação infantil',
        'Organize brincadeiras, jogos e atividades criativas em encontros com crianças da comunidade.',
        'Planejar e conduzir brincadeiras em grupo.',
        NULL,
        'EDUCACAO', 'Praça da Bandeira - Centro', 'Joinville', 'SC',
        pg_temp.em(15, '09:00'), pg_temp.em(15, '12:00'), 6, 'CANCELADA', pg_temp.em(-12, '09:00')),
    (pg_temp.id(4, 6), pg_temp.id(1, 2), pg_temp.id(2, 5), 'Passeios com cães de abrigo',
        'Proporcione passeios e atividades de socialização para cães acolhidos pelo abrigo da associação.',
        'Passear com os cães, ajudar na alimentação e na limpeza dos canis.',
        'Não ter medo de cães de grande porte.',
        'ANIMAIS', 'Abrigo Patas Amigas - Rua Vergueiro, 2100', 'São Paulo', 'SP',
        pg_temp.em(7, '08:00'), pg_temp.em(7, '11:00'), 5, 'ABERTA', pg_temp.em(-5, '09:00')),
    (pg_temp.id(4, 7), pg_temp.id(1, 2), pg_temp.id(2, 4), 'Feira de adoção responsável',
        'Apoie a organização da feira mensal de adoção e o acolhimento das famílias interessadas.',
        'Montagem dos espaços, orientação de visitantes e cuidado com os animais.',
        NULL,
        'ANIMAIS', 'Parque da Aclimação - Portão 1', 'São Paulo', 'SP',
        pg_temp.em(-10, '10:00'), pg_temp.em(-10, '14:00'), 3, 'ENCERRADA', pg_temp.em(-30, '09:00')),
    (pg_temp.id(4, 8), pg_temp.id(1, 2), pg_temp.id(2, 5), 'Fotografia para feira de adoção',
        'Registre os animais e as famílias na próxima feira de adoção para divulgar o trabalho da associação.',
        'Fotografar os animais disponíveis e as adoções do dia.',
        'Câmera ou celular com boa câmera.',
        'COMUNICACAO', 'Parque da Aclimação - Portão 1', 'São Paulo', 'SP',
        pg_temp.em(14, '10:00'), pg_temp.em(14, '14:00'), 2, 'ABERTA', pg_temp.em(-2, '10:00'));

-- =========================================================
-- Candidaturas
-- =========================================================

INSERT INTO candidatura (id, oportunidade_id, voluntario_id, status, criado_em, decidido_em, decidido_por) VALUES
    -- Oportunidade 1: aberta, 1 de 3 vagas ocupada
    (pg_temp.id(5, 1),  pg_temp.id(4, 1), pg_temp.id(2, 6),  'ACEITA',    pg_temp.em(-5, '10:00'), pg_temp.em(-4, '09:00'), pg_temp.id(2, 2)),
    (pg_temp.id(5, 2),  pg_temp.id(4, 1), pg_temp.id(2, 7),  'PENDENTE',  pg_temp.em(-3, '15:00'), NULL, NULL),
    (pg_temp.id(5, 3),  pg_temp.id(4, 1), pg_temp.id(2, 8),  'REJEITADA', pg_temp.em(-5, '11:00'), pg_temp.em(-4, '09:10'), pg_temp.id(2, 2)),
    (pg_temp.id(5, 4),  pg_temp.id(4, 1), pg_temp.id(2, 9),  'CANCELADA', pg_temp.em(-4, '08:00'), NULL, NULL),
    (pg_temp.id(5, 5),  pg_temp.id(4, 1), pg_temp.id(2, 10), 'ACEITA',    pg_temp.em(-5, '12:00'), pg_temp.em(-4, '09:20'), pg_temp.id(2, 1)),  -- decidida pela gestora
    -- Oportunidade 2: aberta e preenchida (2 de 2)
    (pg_temp.id(5, 6),  pg_temp.id(4, 2), pg_temp.id(2, 6),  'ACEITA',    pg_temp.em(-7, '10:00'), pg_temp.em(-6, '14:00'), pg_temp.id(2, 3)),
    (pg_temp.id(5, 7),  pg_temp.id(4, 2), pg_temp.id(2, 11), 'ACEITA',    pg_temp.em(-7, '18:00'), pg_temp.em(-6, '14:05'), pg_temp.id(2, 3)),
    (pg_temp.id(5, 8),  pg_temp.id(4, 2), pg_temp.id(2, 7),  'PENDENTE',  pg_temp.em(-2, '09:00'), NULL, NULL),
    -- Oportunidade 3: encerrada, 4 de 4 vagas ocupadas
    (pg_temp.id(5, 9),  pg_temp.id(4, 3), pg_temp.id(2, 6),  'ACEITA',    pg_temp.em(-35, '10:00'), pg_temp.em(-34, '09:00'), pg_temp.id(2, 2)),
    (pg_temp.id(5, 10), pg_temp.id(4, 3), pg_temp.id(2, 7),  'ACEITA',    pg_temp.em(-35, '11:00'), pg_temp.em(-34, '09:05'), pg_temp.id(2, 2)),
    (pg_temp.id(5, 11), pg_temp.id(4, 3), pg_temp.id(2, 8),  'ACEITA',    pg_temp.em(-33, '10:00'), pg_temp.em(-32, '09:00'), pg_temp.id(2, 2)),
    (pg_temp.id(5, 12), pg_temp.id(4, 3), pg_temp.id(2, 9),  'ACEITA',    pg_temp.em(-33, '12:00'), pg_temp.em(-32, '09:05'), pg_temp.id(2, 2)),
    -- Oportunidade 6: aberta, 1 de 5
    (pg_temp.id(5, 13), pg_temp.id(4, 6), pg_temp.id(2, 10), 'ACEITA',    pg_temp.em(-4, '10:00'), pg_temp.em(-3, '09:00'), pg_temp.id(2, 5)),
    (pg_temp.id(5, 14), pg_temp.id(4, 6), pg_temp.id(2, 11), 'PENDENTE',  pg_temp.em(-1, '20:00'), NULL, NULL),
    -- Oportunidade 7: encerrada, 2 de 3
    (pg_temp.id(5, 15), pg_temp.id(4, 7), pg_temp.id(2, 10), 'ACEITA',    pg_temp.em(-25, '10:00'), pg_temp.em(-24, '09:00'), pg_temp.id(2, 4)),
    (pg_temp.id(5, 16), pg_temp.id(4, 7), pg_temp.id(2, 11), 'ACEITA',    pg_temp.em(-25, '11:00'), pg_temp.em(-24, '09:05'), pg_temp.id(2, 4)),
    (pg_temp.id(5, 17), pg_temp.id(4, 7), pg_temp.id(2, 7),  'REJEITADA', pg_temp.em(-24, '08:00'), pg_temp.em(-23, '09:00'), pg_temp.id(2, 4));

-- =========================================================
-- Participações (nascem no aceite)
-- =========================================================

INSERT INTO participacao (id, candidatura_id, status, horas_realizadas, registrado_em, registrado_por, cancelado_em) VALUES
    (pg_temp.id(6, 1),  pg_temp.id(5, 1),  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (pg_temp.id(6, 2),  pg_temp.id(5, 5),  'CANCELADA',        NULL, NULL, NULL, pg_temp.em(-1, '19:00')),   -- dentro do prazo: devolveu a vaga
    (pg_temp.id(6, 3),  pg_temp.id(5, 6),  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (pg_temp.id(6, 4),  pg_temp.id(5, 7),  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (pg_temp.id(6, 5),  pg_temp.id(5, 9),  'PRESENTE',         4.00, pg_temp.em(-19, '09:00'), pg_temp.id(2, 2), NULL),
    (pg_temp.id(6, 6),  pg_temp.id(5, 10), 'PRESENTE',         3.50, pg_temp.em(-19, '09:02'), pg_temp.id(2, 2), NULL),
    (pg_temp.id(6, 7),  pg_temp.id(5, 11), 'AUSENTE',          NULL, pg_temp.em(-19, '09:04'), pg_temp.id(2, 2), NULL),
    (pg_temp.id(6, 8),  pg_temp.id(5, 12), 'CANCELADA_TARDIA', NULL, NULL, NULL, pg_temp.em(-21, '22:00')),  -- 11 horas antes do início: a vaga não voltou
    (pg_temp.id(6, 9),  pg_temp.id(5, 13), 'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (pg_temp.id(6, 10), pg_temp.id(5, 15), 'PRESENTE',         4.00, pg_temp.em(-9, '09:00'), pg_temp.id(2, 4), NULL),
    (pg_temp.id(6, 11), pg_temp.id(5, 16), 'PRESENTE',         2.50, pg_temp.em(-9, '09:02'), pg_temp.id(2, 4), NULL);

-- =========================================================
-- Histórico de status
-- =========================================================
-- A linha de criação (status_anterior nulo) registra quem criou cada registro.

INSERT INTO historico_status (oportunidade_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (pg_temp.id(4, 1), NULL,       'ABERTA',    pg_temp.id(2, 1), pg_temp.em(-6, '09:00'),  NULL),
    (pg_temp.id(4, 2), NULL,       'ABERTA',    pg_temp.id(2, 1), pg_temp.em(-8, '09:00'),  NULL),
    (pg_temp.id(4, 3), NULL,       'ABERTA',    pg_temp.id(2, 1), pg_temp.em(-40, '09:00'), NULL),
    (pg_temp.id(4, 3), 'ABERTA',   'ENCERRADA', pg_temp.id(2, 2), pg_temp.em(-19, '10:00'), NULL),
    (pg_temp.id(4, 4), NULL,       'RASCUNHO',  pg_temp.id(2, 1), pg_temp.em(-1, '16:00'),  NULL),
    (pg_temp.id(4, 5), NULL,       'ABERTA',    pg_temp.id(2, 1), pg_temp.em(-12, '09:00'), NULL),
    (pg_temp.id(4, 5), 'ABERTA',   'CANCELADA', pg_temp.id(2, 3), pg_temp.em(-3, '14:00'),  'Espaço indisponível na data'),
    (pg_temp.id(4, 6), NULL,       'ABERTA',    pg_temp.id(2, 4), pg_temp.em(-5, '09:00'),  NULL),
    (pg_temp.id(4, 7), NULL,       'ABERTA',    pg_temp.id(2, 4), pg_temp.em(-30, '09:00'), NULL),
    (pg_temp.id(4, 7), 'ABERTA',   'ENCERRADA', pg_temp.id(2, 4), pg_temp.em(-9, '10:00'),  NULL),
    (pg_temp.id(4, 8), NULL,       'RASCUNHO',  pg_temp.id(2, 4), pg_temp.em(-2, '10:00'),  NULL),
    (pg_temp.id(4, 8), 'RASCUNHO', 'ABERTA',    pg_temp.id(2, 5), pg_temp.em(-1, '11:00'),  NULL);

INSERT INTO historico_status (candidatura_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (pg_temp.id(5, 1),  NULL,       'PENDENTE',  pg_temp.id(2, 6),  pg_temp.em(-5, '10:00'),  NULL),
    (pg_temp.id(5, 1),  'PENDENTE', 'ACEITA',    pg_temp.id(2, 2),  pg_temp.em(-4, '09:00'),  NULL),
    (pg_temp.id(5, 2),  NULL,       'PENDENTE',  pg_temp.id(2, 7),  pg_temp.em(-3, '15:00'),  NULL),
    (pg_temp.id(5, 3),  NULL,       'PENDENTE',  pg_temp.id(2, 8),  pg_temp.em(-5, '11:00'),  NULL),
    (pg_temp.id(5, 3),  'PENDENTE', 'REJEITADA', pg_temp.id(2, 2),  pg_temp.em(-4, '09:10'),  'Turma já completa com o perfil buscado'),
    (pg_temp.id(5, 4),  NULL,       'PENDENTE',  pg_temp.id(2, 9),  pg_temp.em(-4, '08:00'),  NULL),
    (pg_temp.id(5, 4),  'PENDENTE', 'CANCELADA', pg_temp.id(2, 9),  pg_temp.em(-2, '18:00'),  NULL),
    (pg_temp.id(5, 5),  NULL,       'PENDENTE',  pg_temp.id(2, 10), pg_temp.em(-5, '12:00'),  NULL),
    (pg_temp.id(5, 5),  'PENDENTE', 'ACEITA',    pg_temp.id(2, 1),  pg_temp.em(-4, '09:20'),  NULL),
    (pg_temp.id(5, 6),  NULL,       'PENDENTE',  pg_temp.id(2, 6),  pg_temp.em(-7, '10:00'),  NULL),
    (pg_temp.id(5, 6),  'PENDENTE', 'ACEITA',    pg_temp.id(2, 3),  pg_temp.em(-6, '14:00'),  NULL),
    (pg_temp.id(5, 7),  NULL,       'PENDENTE',  pg_temp.id(2, 11), pg_temp.em(-7, '18:00'),  NULL),
    (pg_temp.id(5, 7),  'PENDENTE', 'ACEITA',    pg_temp.id(2, 3),  pg_temp.em(-6, '14:05'),  NULL),
    (pg_temp.id(5, 8),  NULL,       'PENDENTE',  pg_temp.id(2, 7),  pg_temp.em(-2, '09:00'),  NULL),
    (pg_temp.id(5, 9),  NULL,       'PENDENTE',  pg_temp.id(2, 6),  pg_temp.em(-35, '10:00'), NULL),
    (pg_temp.id(5, 9),  'PENDENTE', 'ACEITA',    pg_temp.id(2, 2),  pg_temp.em(-34, '09:00'), NULL),
    (pg_temp.id(5, 10), NULL,       'PENDENTE',  pg_temp.id(2, 7),  pg_temp.em(-35, '11:00'), NULL),
    (pg_temp.id(5, 10), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 2),  pg_temp.em(-34, '09:05'), NULL),
    (pg_temp.id(5, 11), NULL,       'PENDENTE',  pg_temp.id(2, 8),  pg_temp.em(-33, '10:00'), NULL),
    (pg_temp.id(5, 11), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 2),  pg_temp.em(-32, '09:00'), NULL),
    (pg_temp.id(5, 12), NULL,       'PENDENTE',  pg_temp.id(2, 9),  pg_temp.em(-33, '12:00'), NULL),
    (pg_temp.id(5, 12), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 2),  pg_temp.em(-32, '09:05'), NULL),
    (pg_temp.id(5, 13), NULL,       'PENDENTE',  pg_temp.id(2, 10), pg_temp.em(-4, '10:00'),  NULL),
    (pg_temp.id(5, 13), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 5),  pg_temp.em(-3, '09:00'),  NULL),
    (pg_temp.id(5, 14), NULL,       'PENDENTE',  pg_temp.id(2, 11), pg_temp.em(-1, '20:00'),  NULL),
    (pg_temp.id(5, 15), NULL,       'PENDENTE',  pg_temp.id(2, 10), pg_temp.em(-25, '10:00'), NULL),
    (pg_temp.id(5, 15), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 4),  pg_temp.em(-24, '09:00'), NULL),
    (pg_temp.id(5, 16), NULL,       'PENDENTE',  pg_temp.id(2, 11), pg_temp.em(-25, '11:00'), NULL),
    (pg_temp.id(5, 16), 'PENDENTE', 'ACEITA',    pg_temp.id(2, 4),  pg_temp.em(-24, '09:05'), NULL),
    (pg_temp.id(5, 17), NULL,       'PENDENTE',  pg_temp.id(2, 7),  pg_temp.em(-24, '08:00'), NULL),
    (pg_temp.id(5, 17), 'PENDENTE', 'REJEITADA', pg_temp.id(2, 4),  pg_temp.em(-23, '09:00'), NULL);

INSERT INTO historico_status (participacao_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (pg_temp.id(6, 1),  NULL,         'CONFIRMADA',       pg_temp.id(2, 2),  pg_temp.em(-4, '09:00'),  NULL),
    (pg_temp.id(6, 2),  NULL,         'CONFIRMADA',       pg_temp.id(2, 1),  pg_temp.em(-4, '09:20'),  NULL),
    (pg_temp.id(6, 2),  'CONFIRMADA', 'CANCELADA',        pg_temp.id(2, 10), pg_temp.em(-1, '19:00'),  'Imprevisto familiar'),
    (pg_temp.id(6, 3),  NULL,         'CONFIRMADA',       pg_temp.id(2, 3),  pg_temp.em(-6, '14:00'),  NULL),
    (pg_temp.id(6, 4),  NULL,         'CONFIRMADA',       pg_temp.id(2, 3),  pg_temp.em(-6, '14:05'),  NULL),
    (pg_temp.id(6, 5),  NULL,         'CONFIRMADA',       pg_temp.id(2, 2),  pg_temp.em(-34, '09:00'), NULL),
    (pg_temp.id(6, 5),  'CONFIRMADA', 'PRESENTE',         pg_temp.id(2, 2),  pg_temp.em(-19, '09:00'), NULL),
    (pg_temp.id(6, 6),  NULL,         'CONFIRMADA',       pg_temp.id(2, 2),  pg_temp.em(-34, '09:05'), NULL),
    (pg_temp.id(6, 6),  'CONFIRMADA', 'PRESENTE',         pg_temp.id(2, 2),  pg_temp.em(-19, '09:02'), 'Saiu meia hora antes'),
    (pg_temp.id(6, 7),  NULL,         'CONFIRMADA',       pg_temp.id(2, 2),  pg_temp.em(-32, '09:00'), NULL),
    (pg_temp.id(6, 7),  'CONFIRMADA', 'AUSENTE',          pg_temp.id(2, 2),  pg_temp.em(-19, '09:04'), NULL),
    (pg_temp.id(6, 8),  NULL,         'CONFIRMADA',       pg_temp.id(2, 2),  pg_temp.em(-32, '09:05'), NULL),
    (pg_temp.id(6, 8),  'CONFIRMADA', 'CANCELADA_TARDIA', pg_temp.id(2, 9),  pg_temp.em(-21, '22:00'), NULL),
    (pg_temp.id(6, 9),  NULL,         'CONFIRMADA',       pg_temp.id(2, 5),  pg_temp.em(-3, '09:00'),  NULL),
    (pg_temp.id(6, 10), NULL,         'CONFIRMADA',       pg_temp.id(2, 4),  pg_temp.em(-24, '09:00'), NULL),
    (pg_temp.id(6, 10), 'CONFIRMADA', 'PRESENTE',         pg_temp.id(2, 4),  pg_temp.em(-9, '09:00'),  NULL),
    (pg_temp.id(6, 11), NULL,         'CONFIRMADA',       pg_temp.id(2, 4),  pg_temp.em(-24, '09:05'), NULL),
    (pg_temp.id(6, 11), 'CONFIRMADA', 'PRESENTE',         pg_temp.id(2, 4),  pg_temp.em(-9, '09:02'),  NULL);

DROP FUNCTION pg_temp.em(INTEGER, TIME);
DROP FUNCTION pg_temp.id(INTEGER, INTEGER);

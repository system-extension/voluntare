-- V2: massa de demonstração (issue #14). Dados fictícios.
-- Senha de todos os usuários: Voluntare@2026 (BCrypt, custo 10).
-- As datas são relativas ao dia em que a migração roda, para que vagas futuras e encerradas façam sentido na demonstração.
-- Todas as linhas respeitam as regras do service: responsável da mesma organização, vagas não excedidas,
-- presença só depois do fim, horas dentro da duração e uma linha de criação no histórico por registro.

-- Data e hora no fuso de Joinville, a d dias de hoje
CREATE FUNCTION pg_temp.em(d INTEGER, hora TIME) RETURNS TIMESTAMPTZ
    LANGUAGE sql STABLE
    AS $$ SELECT (((now() AT TIME ZONE 'America/Sao_Paulo')::date + d) + hora) AT TIME ZONE 'America/Sao_Paulo' $$;

-- =========================================================
-- Organizações e equipes
-- =========================================================

INSERT INTO organizacao (id, nome, descricao, cidade, uf, email, telefone, criado_em) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Instituto Novos Caminhos', 'Reforço escolar, cultura e assistência para famílias da zona sul.',
        'Joinville', 'SC', 'contato@novoscaminhos.example.org', '(47) 3333-1000', pg_temp.em(-60, '09:00')),
    (2, 'Associação Patas Amigas', 'Acolhimento e adoção responsável de cães e gatos.',
        'São Paulo', 'SP', 'contato@patasamigas.example.org', '(11) 4000-2000', pg_temp.em(-45, '09:00'));

INSERT INTO usuario (id, organizacao_id, nome, email, senha_hash, papel, ativo, criado_em) OVERRIDING SYSTEM VALUE VALUES
    -- Instituto Novos Caminhos
    (1,  1,    'Ana Ribeiro',     'ana@novoscaminhos.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'GESTOR',      TRUE,  pg_temp.em(-60, '09:00')),
    (2,  1,    'Bruno Costa',     'bruno@novoscaminhos.example.org',  '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-58, '10:00')),
    (3,  1,    'Carla Mendes',    'carla@novoscaminhos.example.org',  '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-58, '10:30')),
    -- Associação Patas Amigas
    (4,  2,    'Diego Souza',     'diego@patasamigas.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'GESTOR',      TRUE,  pg_temp.em(-45, '09:00')),
    (5,  2,    'Elisa Martins',   'elisa@patasamigas.example.org',    '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', TRUE,  pg_temp.em(-44, '09:00')),
    (12, 2,    'Marcos Teixeira', 'marcos@patasamigas.example.org',   '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'COORDENADOR', FALSE, pg_temp.em(-44, '09:30')),
    -- Voluntários
    (6,  NULL, 'Fernanda Lima',   'fernanda@example.com',             '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-50, '20:00')),
    (7,  NULL, 'Gustavo Alves',   'gustavo@example.com',              '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-48, '19:00')),
    (8,  NULL, 'Helena Rocha',    'helena@example.com',               '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-40, '18:00')),
    (9,  NULL, 'Igor Santos',     'igor@example.com',                 '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-40, '21:00')),
    (10, NULL, 'Julia Ferreira',  'julia@example.com',                '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-35, '12:00')),
    (11, NULL, 'Lucas Pereira',   'lucas@example.com',                '$2a$10$dxrQOMhZOvVcyqeSa2masesIWIOMoT4kkutTIISJY7AKf65ypittK', 'VOLUNTARIO',  TRUE,  pg_temp.em(-30, '08:00'));

INSERT INTO perfil_voluntario (usuario_id, telefone, cidade, disponibilidade) VALUES
    (6,  '(47) 99999-0006', 'Joinville', 'Fins de semana e terças à tarde'),
    (7,  '(47) 99999-0007', 'Joinville', 'Sábados'),
    (8,  '(47) 99999-0008', 'Joinville', 'Manhãs durante a semana'),
    (9,  '(47) 99999-0009', 'Joinville', 'Noites e fins de semana'),
    (10, '(11) 99999-0010', 'São Paulo', 'Horário flexível'),
    (11, '(11) 99999-0011', 'São Paulo', 'Fins de semana');

-- =========================================================
-- Habilidades do voluntário
-- =========================================================

INSERT INTO habilidade (id, nome) OVERRIDING SYSTEM VALUE VALUES
    (1, 'Ensino e reforço escolar'),
    (2, 'Recreação infantil'),
    (3, 'Organização de eventos'),
    (4, 'Cuidado com animais'),
    (5, 'Fotografia'),
    (6, 'Comunicação e redes sociais'),
    (7, 'Primeiros socorros'),
    (8, 'Cozinha'),
    (9, 'Idiomas'),
    (10, 'Educação ambiental');

INSERT INTO voluntario_habilidade (voluntario_id, habilidade_id, tipo) VALUES
    (6, 1, 'HABILIDADE'), (6, 10, 'HABILIDADE'), (6, 2, 'INTERESSE'),
    (7, 3, 'HABILIDADE'), (7, 8, 'HABILIDADE'), (7, 1, 'INTERESSE'),
    (8, 7, 'HABILIDADE'), (8, 2, 'INTERESSE'),
    (9, 3, 'HABILIDADE'), (9, 9, 'INTERESSE'),
    (10, 4, 'HABILIDADE'), (10, 5, 'HABILIDADE'), (10, 6, 'INTERESSE'),
    (11, 4, 'HABILIDADE'), (11, 10, 'INTERESSE');

-- =========================================================
-- Oportunidades
-- =========================================================
-- 1 aberta com vaga · 2 aberta e preenchida · 3 encerrada com presença registrada · 4 rascunho incompleto
-- 5 cancelada · 6 aberta (outra ONG) · 7 encerrada (outra ONG) · 8 publicada a partir de rascunho

INSERT INTO oportunidade (id, organizacao_id, responsavel_id, titulo, descricao, atividades, requisitos, causa,
                          local, cidade, uf, inicio, fim, vagas, status, criado_em) OVERRIDING SYSTEM VALUE VALUES
    (1, 1, 2, 'Apoio escolar para crianças',
        'Apoie crianças do ensino fundamental no desenvolvimento da leitura, da escrita e da matemática em encontros de reforço escolar.',
        'Acompanhar pequenos grupos nas tarefas e propor atividades de leitura.',
        'Paciência, pontualidade e gosto por ensinar.',
        'EDUCACAO', 'Rua XV de Novembro, 1200 - Centro', 'Joinville', 'SC',
        pg_temp.em(10, '14:00'), pg_temp.em(10, '18:00'), 3, 'ABERTA', pg_temp.em(-6, '09:00')),
    (2, 1, 3, 'Educação ambiental nas escolas',
        'Participe de oficinas sobre reciclagem, consumo consciente e cuidado com a natureza em uma escola municipal.',
        'Conduzir dinâmicas com turmas do 5º ano e apoiar a montagem da horta.',
        NULL,
        'MEIO_AMBIENTE', 'Escola Municipal Rui Barbosa - Rua Blumenau, 455', 'Joinville', 'SC',
        pg_temp.em(5, '08:30'), pg_temp.em(5, '11:30'), 2, 'ABERTA', pg_temp.em(-8, '09:00')),
    (3, 1, 2, 'Apoio em eventos beneficentes',
        'Colabore na recepção, organização e orientação de visitantes no bazar beneficente anual do instituto.',
        'Recepção, organização das mesas e apoio no caixa.',
        'Disponibilidade durante toda a manhã.',
        'ASSISTENCIA_SOCIAL', 'Salão comunitário - Rua Ottokar Doerffel, 300', 'Joinville', 'SC',
        pg_temp.em(-20, '09:00'), pg_temp.em(-20, '13:00'), 4, 'ENCERRADA', pg_temp.em(-40, '09:00')),
    (4, 1, 1, 'Oficinas de arte e cultura',
        NULL, NULL, NULL,
        'EDUCACAO', NULL, 'Joinville', 'SC',
        NULL, NULL, NULL, 'RASCUNHO', pg_temp.em(-1, '16:00')),
    (5, 1, 3, 'Recreação infantil',
        'Organize brincadeiras, jogos e atividades criativas em encontros com crianças da comunidade.',
        'Planejar e conduzir brincadeiras em grupo.',
        NULL,
        'EDUCACAO', 'Praça da Bandeira - Centro', 'Joinville', 'SC',
        pg_temp.em(15, '09:00'), pg_temp.em(15, '12:00'), 6, 'CANCELADA', pg_temp.em(-12, '09:00')),
    (6, 2, 5, 'Passeios com cães de abrigo',
        'Proporcione passeios e atividades de socialização para cães acolhidos pelo abrigo da associação.',
        'Passear com os cães, ajudar na alimentação e na limpeza dos canis.',
        'Não ter medo de cães de grande porte.',
        'ANIMAIS', 'Abrigo Patas Amigas - Rua Vergueiro, 2100', 'São Paulo', 'SP',
        pg_temp.em(7, '08:00'), pg_temp.em(7, '11:00'), 5, 'ABERTA', pg_temp.em(-5, '09:00')),
    (7, 2, 4, 'Feira de adoção responsável',
        'Apoie a organização da feira mensal de adoção e o acolhimento das famílias interessadas.',
        'Montagem dos espaços, orientação de visitantes e cuidado com os animais.',
        NULL,
        'ANIMAIS', 'Parque da Aclimação - Portão 1', 'São Paulo', 'SP',
        pg_temp.em(-10, '10:00'), pg_temp.em(-10, '14:00'), 3, 'ENCERRADA', pg_temp.em(-30, '09:00')),
    (8, 2, 5, 'Fotografia para feira de adoção',
        'Registre os animais e as famílias na próxima feira de adoção para divulgar o trabalho da associação.',
        'Fotografar os animais disponíveis e as adoções do dia.',
        'Câmera ou celular com boa câmera.',
        'COMUNICACAO', 'Parque da Aclimação - Portão 1', 'São Paulo', 'SP',
        pg_temp.em(14, '10:00'), pg_temp.em(14, '14:00'), 2, 'ABERTA', pg_temp.em(-2, '10:00'));

-- =========================================================
-- Candidaturas
-- =========================================================

INSERT INTO candidatura (id, oportunidade_id, voluntario_id, status, criado_em, decidido_em, decidido_por) OVERRIDING SYSTEM VALUE VALUES
    -- Oportunidade 1: aberta, 1 de 3 vagas ocupada
    (1,  1, 6,  'ACEITA',    pg_temp.em(-5, '10:00'), pg_temp.em(-4, '09:00'), 2),
    (2,  1, 7,  'PENDENTE',  pg_temp.em(-3, '15:00'), NULL, NULL),
    (3,  1, 8,  'REJEITADA', pg_temp.em(-5, '11:00'), pg_temp.em(-4, '09:10'), 2),
    (4,  1, 9,  'CANCELADA', pg_temp.em(-4, '08:00'), NULL, NULL),
    (5,  1, 10, 'ACEITA',    pg_temp.em(-5, '12:00'), pg_temp.em(-4, '09:20'), 1),  -- decidida pela gestora
    -- Oportunidade 2: aberta e preenchida (2 de 2)
    (6,  2, 6,  'ACEITA',    pg_temp.em(-7, '10:00'), pg_temp.em(-6, '14:00'), 3),
    (7,  2, 11, 'ACEITA',    pg_temp.em(-7, '18:00'), pg_temp.em(-6, '14:05'), 3),
    (8,  2, 7,  'PENDENTE',  pg_temp.em(-2, '09:00'), NULL, NULL),
    -- Oportunidade 3: encerrada, 4 de 4 vagas ocupadas
    (9,  3, 6,  'ACEITA',    pg_temp.em(-35, '10:00'), pg_temp.em(-34, '09:00'), 2),
    (10, 3, 7,  'ACEITA',    pg_temp.em(-35, '11:00'), pg_temp.em(-34, '09:05'), 2),
    (11, 3, 8,  'ACEITA',    pg_temp.em(-33, '10:00'), pg_temp.em(-32, '09:00'), 2),
    (12, 3, 9,  'ACEITA',    pg_temp.em(-33, '12:00'), pg_temp.em(-32, '09:05'), 2),
    -- Oportunidade 6: aberta, 1 de 5
    (13, 6, 10, 'ACEITA',    pg_temp.em(-4, '10:00'), pg_temp.em(-3, '09:00'), 5),
    (14, 6, 11, 'PENDENTE',  pg_temp.em(-1, '20:00'), NULL, NULL),
    -- Oportunidade 7: encerrada, 2 de 3
    (15, 7, 10, 'ACEITA',    pg_temp.em(-25, '10:00'), pg_temp.em(-24, '09:00'), 4),
    (16, 7, 11, 'ACEITA',    pg_temp.em(-25, '11:00'), pg_temp.em(-24, '09:05'), 4),
    (17, 7, 7,  'REJEITADA', pg_temp.em(-24, '08:00'), pg_temp.em(-23, '09:00'), 4);

-- =========================================================
-- Participações (nascem no aceite)
-- =========================================================

INSERT INTO participacao (id, candidatura_id, status, horas_realizadas, registrado_em, registrado_por, cancelado_em) OVERRIDING SYSTEM VALUE VALUES
    (1,  1,  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (2,  5,  'CANCELADA',        NULL, NULL, NULL, pg_temp.em(-1, '19:00')),   -- dentro do prazo: devolveu a vaga
    (3,  6,  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (4,  7,  'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (5,  9,  'PRESENTE',         4.00, pg_temp.em(-19, '09:00'), 2, NULL),
    (6,  10, 'PRESENTE',         3.50, pg_temp.em(-19, '09:02'), 2, NULL),
    (7,  11, 'AUSENTE',          NULL, pg_temp.em(-19, '09:04'), 2, NULL),
    (8,  12, 'CANCELADA_TARDIA', NULL, NULL, NULL, pg_temp.em(-21, '22:00')),  -- 11 horas antes do início: a vaga não voltou
    (9,  13, 'CONFIRMADA',       NULL, NULL, NULL, NULL),
    (10, 15, 'PRESENTE',         4.00, pg_temp.em(-9, '09:00'), 4, NULL),
    (11, 16, 'PRESENTE',         2.50, pg_temp.em(-9, '09:02'), 4, NULL);

-- =========================================================
-- Histórico de status
-- =========================================================
-- A linha de criação (status_anterior nulo) registra quem criou cada registro.

INSERT INTO historico_status (oportunidade_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (1, NULL,       'ABERTA',    1, pg_temp.em(-6, '09:00'),  NULL),
    (2, NULL,       'ABERTA',    1, pg_temp.em(-8, '09:00'),  NULL),
    (3, NULL,       'ABERTA',    1, pg_temp.em(-40, '09:00'), NULL),
    (3, 'ABERTA',   'ENCERRADA', 2, pg_temp.em(-19, '10:00'), NULL),
    (4, NULL,       'RASCUNHO',  1, pg_temp.em(-1, '16:00'),  NULL),
    (5, NULL,       'ABERTA',    1, pg_temp.em(-12, '09:00'), NULL),
    (5, 'ABERTA',   'CANCELADA', 3, pg_temp.em(-3, '14:00'),  'Espaço indisponível na data'),
    (6, NULL,       'ABERTA',    4, pg_temp.em(-5, '09:00'),  NULL),
    (7, NULL,       'ABERTA',    4, pg_temp.em(-30, '09:00'), NULL),
    (7, 'ABERTA',   'ENCERRADA', 4, pg_temp.em(-9, '10:00'),  NULL),
    (8, NULL,       'RASCUNHO',  4, pg_temp.em(-2, '10:00'),  NULL),
    (8, 'RASCUNHO', 'ABERTA',    5, pg_temp.em(-1, '11:00'),  NULL);

INSERT INTO historico_status (candidatura_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (1,  NULL,       'PENDENTE',  6,  pg_temp.em(-5, '10:00'),  NULL),
    (1,  'PENDENTE', 'ACEITA',    2,  pg_temp.em(-4, '09:00'),  NULL),
    (2,  NULL,       'PENDENTE',  7,  pg_temp.em(-3, '15:00'),  NULL),
    (3,  NULL,       'PENDENTE',  8,  pg_temp.em(-5, '11:00'),  NULL),
    (3,  'PENDENTE', 'REJEITADA', 2,  pg_temp.em(-4, '09:10'),  'Turma já completa com o perfil buscado'),
    (4,  NULL,       'PENDENTE',  9,  pg_temp.em(-4, '08:00'),  NULL),
    (4,  'PENDENTE', 'CANCELADA', 9,  pg_temp.em(-2, '18:00'),  NULL),
    (5,  NULL,       'PENDENTE',  10, pg_temp.em(-5, '12:00'),  NULL),
    (5,  'PENDENTE', 'ACEITA',    1,  pg_temp.em(-4, '09:20'),  NULL),
    (6,  NULL,       'PENDENTE',  6,  pg_temp.em(-7, '10:00'),  NULL),
    (6,  'PENDENTE', 'ACEITA',    3,  pg_temp.em(-6, '14:00'),  NULL),
    (7,  NULL,       'PENDENTE',  11, pg_temp.em(-7, '18:00'),  NULL),
    (7,  'PENDENTE', 'ACEITA',    3,  pg_temp.em(-6, '14:05'),  NULL),
    (8,  NULL,       'PENDENTE',  7,  pg_temp.em(-2, '09:00'),  NULL),
    (9,  NULL,       'PENDENTE',  6,  pg_temp.em(-35, '10:00'), NULL),
    (9,  'PENDENTE', 'ACEITA',    2,  pg_temp.em(-34, '09:00'), NULL),
    (10, NULL,       'PENDENTE',  7,  pg_temp.em(-35, '11:00'), NULL),
    (10, 'PENDENTE', 'ACEITA',    2,  pg_temp.em(-34, '09:05'), NULL),
    (11, NULL,       'PENDENTE',  8,  pg_temp.em(-33, '10:00'), NULL),
    (11, 'PENDENTE', 'ACEITA',    2,  pg_temp.em(-32, '09:00'), NULL),
    (12, NULL,       'PENDENTE',  9,  pg_temp.em(-33, '12:00'), NULL),
    (12, 'PENDENTE', 'ACEITA',    2,  pg_temp.em(-32, '09:05'), NULL),
    (13, NULL,       'PENDENTE',  10, pg_temp.em(-4, '10:00'),  NULL),
    (13, 'PENDENTE', 'ACEITA',    5,  pg_temp.em(-3, '09:00'),  NULL),
    (14, NULL,       'PENDENTE',  11, pg_temp.em(-1, '20:00'),  NULL),
    (15, NULL,       'PENDENTE',  10, pg_temp.em(-25, '10:00'), NULL),
    (15, 'PENDENTE', 'ACEITA',    4,  pg_temp.em(-24, '09:00'), NULL),
    (16, NULL,       'PENDENTE',  11, pg_temp.em(-25, '11:00'), NULL),
    (16, 'PENDENTE', 'ACEITA',    4,  pg_temp.em(-24, '09:05'), NULL),
    (17, NULL,       'PENDENTE',  7,  pg_temp.em(-24, '08:00'), NULL),
    (17, 'PENDENTE', 'REJEITADA', 4,  pg_temp.em(-23, '09:00'), NULL);

INSERT INTO historico_status (participacao_id, status_anterior, status_novo, alterado_por, alterado_em, observacao) VALUES
    (1,  NULL,         'CONFIRMADA',       2,  pg_temp.em(-4, '09:00'),  NULL),
    (2,  NULL,         'CONFIRMADA',       1,  pg_temp.em(-4, '09:20'),  NULL),
    (2,  'CONFIRMADA', 'CANCELADA',        10, pg_temp.em(-1, '19:00'),  'Imprevisto familiar'),
    (3,  NULL,         'CONFIRMADA',       3,  pg_temp.em(-6, '14:00'),  NULL),
    (4,  NULL,         'CONFIRMADA',       3,  pg_temp.em(-6, '14:05'),  NULL),
    (5,  NULL,         'CONFIRMADA',       2,  pg_temp.em(-34, '09:00'), NULL),
    (5,  'CONFIRMADA', 'PRESENTE',         2,  pg_temp.em(-19, '09:00'), NULL),
    (6,  NULL,         'CONFIRMADA',       2,  pg_temp.em(-34, '09:05'), NULL),
    (6,  'CONFIRMADA', 'PRESENTE',         2,  pg_temp.em(-19, '09:02'), 'Saiu meia hora antes'),
    (7,  NULL,         'CONFIRMADA',       2,  pg_temp.em(-32, '09:00'), NULL),
    (7,  'CONFIRMADA', 'AUSENTE',          2,  pg_temp.em(-19, '09:04'), NULL),
    (8,  NULL,         'CONFIRMADA',       2,  pg_temp.em(-32, '09:05'), NULL),
    (8,  'CONFIRMADA', 'CANCELADA_TARDIA', 9,  pg_temp.em(-21, '22:00'), NULL),
    (9,  NULL,         'CONFIRMADA',       5,  pg_temp.em(-3, '09:00'),  NULL),
    (10, NULL,         'CONFIRMADA',       4,  pg_temp.em(-24, '09:00'), NULL),
    (10, 'CONFIRMADA', 'PRESENTE',         4,  pg_temp.em(-9, '09:00'),  NULL),
    (11, NULL,         'CONFIRMADA',       4,  pg_temp.em(-24, '09:05'), NULL),
    (11, 'CONFIRMADA', 'PRESENTE',         4,  pg_temp.em(-9, '09:02'),  NULL);

-- =========================================================
-- Sequências das identidades continuam depois dos ids fixos
-- =========================================================

SELECT setval(pg_get_serial_sequence('organizacao', 'id'), (SELECT max(id) FROM organizacao));
SELECT setval(pg_get_serial_sequence('usuario', 'id'), (SELECT max(id) FROM usuario));
SELECT setval(pg_get_serial_sequence('habilidade', 'id'), (SELECT max(id) FROM habilidade));
SELECT setval(pg_get_serial_sequence('oportunidade', 'id'), (SELECT max(id) FROM oportunidade));
SELECT setval(pg_get_serial_sequence('candidatura', 'id'), (SELECT max(id) FROM candidatura));
SELECT setval(pg_get_serial_sequence('participacao', 'id'), (SELECT max(id) FROM participacao));

DROP FUNCTION pg_temp.em(INTEGER, TIME);

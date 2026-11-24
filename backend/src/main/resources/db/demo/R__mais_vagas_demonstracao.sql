-- Dados extras de demonstração: descrições mais completas nas vagas da V8 e 10 vagas abertas a mais.
--
-- Fica em db/demo, e não em db/migration, de propósito:
--   * o sistema rodando (dev, Docker, avaliação) carrega db/migration e db/demo (application.yaml);
--   * os testes carregam só db/migration (TestcontainersConfiguration), então os números que eles
--     conferem (painel, busca, coerência da carga) continuam os mesmos.
-- É uma migração repetível (R__): roda depois das versionadas e só roda de novo se este arquivo mudar.
-- Tudo é idempotente: ids fixos com ON CONFLICT e UPDATE só se a descrição ainda for a original da V8,
-- para não apagar o que alguém tenha editado pela tela.
-- As datas são relativas ao dia em que o script roda; para renovar, recriar o banco (docker compose down -v).

CREATE OR REPLACE FUNCTION pg_temp.id(tabela INTEGER, n INTEGER) RETURNS UUID
    LANGUAGE sql IMMUTABLE
    AS $$ SELECT (tabela::text || '0000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid $$;

CREATE OR REPLACE FUNCTION pg_temp.em(d INTEGER, hora TIME) RETURNS TIMESTAMPTZ
    LANGUAGE sql STABLE
    AS $$ SELECT (((now() AT TIME ZONE 'America/Sao_Paulo')::date + d) + hora) AT TIME ZONE 'America/Sao_Paulo' $$;

-- =========================================================
-- Descrições mais completas das vagas da V8
-- =========================================================

UPDATE oportunidade SET
    descricao = 'O Instituto Novos Caminhos atende cerca de 40 crianças do 2º ao 5º ano que estão com dificuldade em leitura, escrita e matemática. Nos encontros de reforço, cada voluntário acompanha um pequeno grupo, ajuda nas tarefas da escola e propõe atividades que tornam o aprendizado mais leve. A equipe pedagógica do instituto prepara o material e fica disponível durante todo o encontro.',
    atividades = 'Acompanhar grupos de 3 a 4 crianças nas tarefas escolares, conduzir leituras em voz alta, propor jogos de matemática e registrar no caderno de acompanhamento como foi o encontro.',
    requisitos = 'Paciência, pontualidade e gosto por ensinar. Não é preciso ser professor: a equipe orienta antes do primeiro encontro.'
WHERE id = pg_temp.id(4, 1)
  AND descricao = 'Apoie crianças do ensino fundamental no desenvolvimento da leitura, da escrita e da matemática em encontros de reforço escolar.';

UPDATE oportunidade SET
    descricao = 'Em parceria com a Escola Municipal Rui Barbosa, o instituto leva oficinas de educação ambiental para as turmas do 5º ano. Os voluntários ajudam a conduzir dinâmicas sobre reciclagem e consumo consciente e participam da montagem da horta da escola, que depois é cuidada pelos próprios alunos.',
    atividades = 'Conduzir dinâmicas com turmas do 5º ano, separar materiais recicláveis com as crianças e apoiar a montagem dos canteiros da horta.',
    requisitos = 'Gostar de trabalhar com crianças e não se importar em sujar as mãos na horta.'
WHERE id = pg_temp.id(4, 2)
  AND descricao = 'Participe de oficinas sobre reciclagem, consumo consciente e cuidado com a natureza em uma escola municipal.';

UPDATE oportunidade SET
    descricao = 'O bazar beneficente anual é a principal fonte de recursos do instituto para o ano seguinte. Os voluntários ajudam a receber o público, organizar as mesas de roupas e livros e apoiar o caixa, garantindo que tudo corra bem durante a manhã.'
WHERE id = pg_temp.id(4, 3)
  AND descricao = 'Colabore na recepção, organização e orientação de visitantes no bazar beneficente anual do instituto.';

UPDATE oportunidade SET
    descricao = 'Uma manhã de brincadeiras, jogos e atividades criativas na Praça da Bandeira para as crianças da comunidade atendida pelo instituto. Os voluntários planejam e conduzem as atividades em grupo com o apoio da equipe de recreação.'
WHERE id = pg_temp.id(4, 5)
  AND descricao = 'Organize brincadeiras, jogos e atividades criativas em encontros com crianças da comunidade.';

UPDATE oportunidade SET
    descricao = 'O abrigo da Associação Patas Amigas cuida hoje de mais de 60 cães à espera de adoção. Os passeios e as atividades de socialização ajudam os animais a ficarem mais calmos e preparados para conhecer as famílias. Os voluntários recebem uma orientação rápida da equipe antes de sair com os cães.',
    atividades = 'Passear com os cães em duplas, ajudar na alimentação e na limpeza dos canis e brincar com os animais mais tímidos.',
    requisitos = 'Não ter medo de cães de grande porte e usar roupa e calçado confortáveis.'
WHERE id = pg_temp.id(4, 6)
  AND descricao = 'Proporcione passeios e atividades de socialização para cães acolhidos pelo abrigo da associação.';

UPDATE oportunidade SET
    descricao = 'A feira mensal de adoção reúne cães e gatos do abrigo no Parque da Aclimação. Os voluntários ajudam a montar os espaços, orientam as famílias interessadas e cuidam dos animais durante o evento.'
WHERE id = pg_temp.id(4, 7)
  AND descricao = 'Apoie a organização da feira mensal de adoção e o acolhimento das famílias interessadas.';

UPDATE oportunidade SET
    descricao = 'Boas fotos aumentam muito as chances de adoção. Na próxima feira, o voluntário registra os animais disponíveis e as famílias que adotarem, e as imagens vão para as redes sociais e para o site da associação.',
    atividades = 'Fotografar os animais disponíveis, registrar as adoções do dia e separar as melhores fotos para a equipe de comunicação.'
WHERE id = pg_temp.id(4, 8)
  AND descricao = 'Registre os animais e as famílias na próxima feira de adoção para divulgar o trabalho da associação.';

-- =========================================================
-- 10 vagas abertas a mais (ids 101 a 110)
-- Instituto Novos Caminhos (org 1): Ana 1, Bruno 2, Carla 3 · Patas Amigas (org 2): Diego 4, Elisa 5
-- =========================================================

INSERT INTO oportunidade (id, organizacao_id, responsavel_id, titulo, descricao, atividades, requisitos, causa,
                          local, cidade, uf, inicio, fim, vagas, status, criado_em) VALUES
    (pg_temp.id(4, 101), pg_temp.id(1, 1), pg_temp.id(2, 3), 'Leitura em voz alta na biblioteca comunitária',
        'Toda semana a biblioteca comunitária do bairro recebe crianças de 4 a 8 anos para a hora do conto. Os voluntários escolhem livros com a equipe, leem em voz alta e conduzem uma conversa sobre a história, incentivando o gosto pela leitura desde cedo.',
        'Escolher os livros com a bibliotecária, ler em voz alta para grupos pequenos e propor desenhos ou perguntas sobre a história.',
        'Gostar de ler em voz alta e ter paciência com crianças pequenas.',
        'EDUCACAO', 'Biblioteca Comunitária do Boa Vista - Rua Tuiuti, 85', 'Joinville', 'SC',
        pg_temp.em(6, '14:00'), pg_temp.em(6, '17:00'), 4, 'ABERTA', pg_temp.em(-3, '10:00')),
    (pg_temp.id(4, 102), pg_temp.id(1, 1), pg_temp.id(2, 2), 'Mutirão de limpeza do Rio Cachoeira',
        'Um sábado de mutirão para retirar lixo das margens do Rio Cachoeira, no trecho do centro de Joinville. O instituto fornece luvas, sacos e água, e uma equipe da prefeitura recolhe o material no fim da manhã. Além da limpeza, os voluntários conversam com quem passa sobre o descarte correto do lixo.',
        'Recolher resíduos das margens, separar o que é reciclável e ajudar na conversa com moradores e comerciantes.',
        'Calçado fechado, roupa que possa sujar e protetor solar.',
        'MEIO_AMBIENTE', 'Ponto de encontro: Praça Nereu Ramos - Centro', 'Joinville', 'SC',
        pg_temp.em(9, '08:00'), pg_temp.em(9, '12:00'), 15, 'ABERTA', pg_temp.em(-4, '09:30')),
    (pg_temp.id(4, 103), pg_temp.id(1, 1), pg_temp.id(2, 1), 'Campanha do agasalho: triagem de doações',
        'A campanha do agasalho recebeu centenas de peças nas últimas semanas. Precisamos de ajuda para separar as roupas por tamanho e estado, montar os kits por família e deixar tudo pronto para a entrega do fim de semana.',
        'Separar as peças por tamanho e tipo, descartar o que não está em condições de uso e montar os kits por família.',
        NULL,
        'ASSISTENCIA_SOCIAL', 'Sede do Instituto Novos Caminhos - Rua XV de Novembro, 1200', 'Joinville', 'SC',
        pg_temp.em(4, '18:30'), pg_temp.em(4, '21:30'), 8, 'ABERTA', pg_temp.em(-2, '15:00')),
    (pg_temp.id(4, 104), pg_temp.id(1, 1), pg_temp.id(2, 2), 'Aulas de celular e internet para idosos',
        'Muitos idosos atendidos pelo instituto querem aprender a usar o celular para falar com a família, marcar consultas e evitar golpes. Nas aulas, cada voluntário acompanha duas ou três pessoas com calma, no ritmo de cada uma.',
        'Ensinar o básico do celular: chamadas de vídeo, mensagens, fotos, aplicativos de saúde e como reconhecer golpes.',
        'Paciência e linguagem simples. Saber usar Android e iPhone ajuda.',
        'EDUCACAO', 'Sede do Instituto Novos Caminhos - Rua XV de Novembro, 1200', 'Joinville', 'SC',
        pg_temp.em(12, '09:00'), pg_temp.em(12, '11:00'), 5, 'ABERTA', pg_temp.em(-1, '11:00')),
    (pg_temp.id(4, 105), pg_temp.id(1, 1), pg_temp.id(2, 3), 'Cozinha solidária: preparo de marmitas',
        'A cozinha solidária do instituto prepara cerca de 150 marmitas por semana para famílias em situação de vulnerabilidade. Os voluntários ajudam no preparo dos alimentos, na montagem das marmitas e na organização da distribuição.',
        'Higienizar e cortar os alimentos, montar as marmitas e organizar a fila da distribuição.',
        'Usar touca e avental (o instituto fornece) e seguir as orientações de higiene da cozinha.',
        'ASSISTENCIA_SOCIAL', 'Cozinha comunitária - Rua Ottokar Doerffel, 300', 'Joinville', 'SC',
        pg_temp.em(3, '10:00'), pg_temp.em(3, '14:00'), 6, 'ABERTA', pg_temp.em(-5, '08:00')),
    (pg_temp.id(4, 106), pg_temp.id(1, 1), pg_temp.id(2, 1), 'Plantio de mudas no Parque Caieiras',
        'Em parceria com a secretaria do meio ambiente, vamos plantar mudas de espécies nativas da Mata Atlântica em uma área degradada do Parque Caieiras. Uma bióloga explica no início como fazer o plantio e por que cada espécie foi escolhida.',
        'Abrir as covas, plantar as mudas, regar e colocar as estacas de identificação.',
        'Disposição para trabalho ao ar livre, calçado fechado e garrafa de água.',
        'MEIO_AMBIENTE', 'Parque Caieiras - Rua Arno Waldemar Döhler, s/n', 'Joinville', 'SC',
        pg_temp.em(16, '08:00'), pg_temp.em(16, '11:30'), 12, 'ABERTA', pg_temp.em(-1, '16:30')),
    (pg_temp.id(4, 107), pg_temp.id(1, 2), pg_temp.id(2, 5), 'Banho e cuidados no abrigo',
        'Antes da feira de adoção, os cães do abrigo recebem banho, escovação e um check-up rápido. Os voluntários ajudam a equipe a deixar todos limpos e confortáveis para conhecer as novas famílias.',
        'Dar banho e secar os cães, escovar o pelo, cortar unhas com a orientação da veterinária e limpar a área de banho.',
        'Não ter medo de cães e usar roupa que possa molhar.',
        'ANIMAIS', 'Abrigo Patas Amigas - Rua Vergueiro, 2100', 'São Paulo', 'SP',
        pg_temp.em(8, '09:00'), pg_temp.em(8, '13:00'), 4, 'ABERTA', pg_temp.em(-3, '09:00')),
    (pg_temp.id(4, 108), pg_temp.id(1, 2), pg_temp.id(2, 4), 'Redes sociais da campanha de adoção',
        'A associação vai lançar uma campanha de adoção de cães adultos, que costumam esperar mais tempo por uma família. Buscamos voluntários para planejar as publicações, escrever as legendas e montar os vídeos curtos com a equipe.',
        'Planejar o calendário de publicações, escrever legendas e editar vídeos curtos a partir das fotos do abrigo.',
        'Familiaridade com Instagram e algum aplicativo de edição de vídeo.',
        'COMUNICACAO', 'Escritório da Associação Patas Amigas - Rua Vergueiro, 2100', 'São Paulo', 'SP',
        pg_temp.em(5, '19:00'), pg_temp.em(5, '21:00'), 2, 'ABERTA', pg_temp.em(-2, '18:00')),
    (pg_temp.id(4, 109), pg_temp.id(1, 2), pg_temp.id(2, 4), 'Mutirão de castração: recepção dos tutores',
        'No mutirão de castração gratuita, veterinários parceiros atendem cerca de 80 animais em um dia. Os voluntários recebem os tutores, conferem os cadastros, orientam sobre o jejum e acompanham a saída dos animais depois da cirurgia.',
        'Recepcionar os tutores, conferir os cadastros, organizar a fila e passar as orientações do pós-operatório.',
        'Organização e simpatia no atendimento. Noções de primeiros socorros ajudam.',
        'ANIMAIS', 'Centro Comunitário da Aclimação - Rua Muniz de Sousa, 1200', 'São Paulo', 'SP',
        pg_temp.em(11, '07:30'), pg_temp.em(11, '12:00'), 6, 'ABERTA', pg_temp.em(-4, '14:00')),
    (pg_temp.id(4, 110), pg_temp.id(1, 2), pg_temp.id(2, 5), 'Posse responsável nas escolas',
        'Uma conversa com turmas do ensino fundamental sobre cuidados com animais, vacinação, castração e adoção responsável. A associação leva o material e um cão treinado para a atividade, e os voluntários ajudam a conduzir as dinâmicas.',
        'Apresentar os temas com o material da associação, conduzir as dinâmicas e responder às perguntas das crianças.',
        'Facilidade para falar em público e gostar de crianças.',
        'EDUCACAO', 'Escola Estadual Brasílio Machado - Rua Domingos de Morais, 1050', 'São Paulo', 'SP',
        pg_temp.em(18, '13:30'), pg_temp.em(18, '16:30'), 3, 'ABERTA', pg_temp.em(-1, '10:00'))
ON CONFLICT (id) DO NOTHING;

-- Habilidades: 1 Ensino e reforço escolar · 2 Recreação infantil · 3 Organização de eventos · 4 Cuidado com animais
-- 5 Fotografia · 6 Comunicação e redes sociais · 7 Primeiros socorros · 8 Cozinha · 9 Idiomas · 10 Educação ambiental
INSERT INTO oportunidade_habilidade (oportunidade_id, habilidade_id) VALUES
    (pg_temp.id(4, 101), pg_temp.id(3, 1)), (pg_temp.id(4, 101), pg_temp.id(3, 2)),
    (pg_temp.id(4, 102), pg_temp.id(3, 10)),
    (pg_temp.id(4, 103), pg_temp.id(3, 3)),
    (pg_temp.id(4, 104), pg_temp.id(3, 1)),
    (pg_temp.id(4, 105), pg_temp.id(3, 8)),
    (pg_temp.id(4, 106), pg_temp.id(3, 10)),
    (pg_temp.id(4, 107), pg_temp.id(3, 4)),
    (pg_temp.id(4, 108), pg_temp.id(3, 6)), (pg_temp.id(4, 108), pg_temp.id(3, 5)),
    (pg_temp.id(4, 109), pg_temp.id(3, 3)), (pg_temp.id(4, 109), pg_temp.id(3, 7)),
    (pg_temp.id(4, 110), pg_temp.id(3, 1)), (pg_temp.id(4, 110), pg_temp.id(3, 4))
ON CONFLICT DO NOTHING;

-- Linha de criação no histórico (rastreabilidade), uma vez por vaga.
INSERT INTO historico_status (oportunidade_id, status_anterior, status_novo, alterado_por, alterado_em)
SELECT o.id, NULL, 'ABERTA', o.responsavel_id, o.criado_em
FROM oportunidade o
WHERE o.id IN (pg_temp.id(4, 101), pg_temp.id(4, 102), pg_temp.id(4, 103), pg_temp.id(4, 104), pg_temp.id(4, 105),
               pg_temp.id(4, 106), pg_temp.id(4, 107), pg_temp.id(4, 108), pg_temp.id(4, 109), pg_temp.id(4, 110))
  AND NOT EXISTS (SELECT 1 FROM historico_status h WHERE h.oportunidade_id = o.id);

DROP FUNCTION pg_temp.em(INTEGER, TIME);
DROP FUNCTION pg_temp.id(INTEGER, INTEGER);

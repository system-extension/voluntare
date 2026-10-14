// Conteúdo fictício para apresentação do frontend. Não representa vagas reais.
const opportunities = [
  ['Apoio escolar para crianças', 'Instituto Novos Caminhos', 'Joinville, SC', 'Educação', 'Presencial', '4 horas por semana', 'Apoie crianças no desenvolvimento da leitura, da escrita e da matemática em encontros de reforço escolar.'],
  ['Voluntário em cuidado animal', 'Associação Patas Amigas', 'São Paulo, SP', 'Animais', 'Presencial', 'Sábados', 'Ajude na rotina de acolhimento, alimentação e socialização de cães e gatos que aguardam uma família.'],
  ['Mentoria de carreira para jovens', 'Projeto Primeiro Passo', 'Remoto', 'Educação', 'Remoto', '2 horas por semana', 'Compartilhe sua experiência profissional e ajude jovens a planejar os primeiros passos no mundo do trabalho.'],
  ['Apoio na distribuição de alimentos', 'Rede Mesa Solidária', 'Curitiba, PR', 'Assistência social', 'Presencial', 'Fins de semana', 'Participe da organização de alimentos e da entrega de cestas para famílias atendidas pelo projeto.'],
  ['Mutirão de limpeza de praias', 'Coletivo Mar Vivo', 'Florianópolis, SC', 'Meio ambiente', 'Presencial', 'Ação pontual', 'Junte-se a um mutirão de coleta de resíduos e conscientização sobre a preservação do litoral.'],
  ['Designer voluntário', 'Instituto Mãos que Transformam', 'Remoto', 'Comunicação', 'Remoto', '3 horas por semana', 'Crie materiais de comunicação para campanhas sociais, eventos e projetos comunitários.'],
  ['Companhia e acolhimento de idosos', 'Casa Laços de Afeto', 'Joinville, SC', 'Assistência social', 'Presencial', '2 horas por semana', 'Compartilhe histórias, leituras e momentos de convivência com pessoas idosas.'],
  ['Oficinas de programação', 'Projeto Código do Amanhã', 'São Paulo, SP', 'Educação', 'Híbrido', '4 horas por semana', 'Ensine fundamentos de tecnologia e programação para jovens em oficinas práticas.'],
  ['Plantio de árvores e hortas urbanas', 'Associação Raízes do Bairro', 'Belo Horizonte, MG', 'Meio ambiente', 'Presencial', 'Sábados', 'Cuide de espaços verdes e contribua para hortas comunitárias com moradores do bairro.'],
  ['Comunicação e redes sociais', 'Rede Conexão Solidária', 'Remoto', 'Comunicação', 'Remoto', '3 horas por semana', 'Ajude a contar histórias de impacto e divulgar ações sociais nas redes sociais.'],
  ['Recreação infantil', 'Instituto Brincar e Crescer', 'Curitiba, PR', 'Educação', 'Presencial', 'Sábados', 'Organize brincadeiras, jogos e atividades criativas em encontros com crianças da comunidade.'],
  ['Apoio em eventos beneficentes', 'Associação Juntos Pelo Bem', 'Joinville, SC', 'Assistência social', 'Presencial', 'Ação pontual', 'Colabore na recepção, organização e orientação de visitantes em eventos solidários.'],
  ['Aulas de português para migrantes', 'Projeto Pontes Abertas', 'Remoto', 'Educação', 'Remoto', '2 horas por semana', 'Facilite encontros de conversação e acolhimento para pessoas que estão aprendendo português.'],
  ['Fotografia para projetos sociais', 'Coletivo Olhares da Comunidade', 'Rio de Janeiro, RJ', 'Comunicação', 'Presencial', 'Ação pontual', 'Registre atividades de projetos sociais e ajude a dar visibilidade às iniciativas locais.'],
  ['Organização de doações', 'Banco Comunitário de Solidariedade', 'São Paulo, SP', 'Assistência social', 'Presencial', '4 horas por semana', 'Ajude na triagem e organização de roupas, brinquedos e materiais destinados a famílias.'],
  ['Apoio à adoção responsável', 'Projeto Lar de Patas', 'Curitiba, PR', 'Animais', 'Presencial', 'Fins de semana', 'Apoie a organização de feiras de adoção e o acolhimento de visitantes.'],
  ['Professor de inglês voluntário', 'Instituto Aprender Juntos', 'Remoto', 'Educação', 'Remoto', '2 horas por semana', 'Prepare aulas de inglês acessíveis para jovens e adultos de projetos comunitários.'],
  ['Educação ambiental nas escolas', 'Instituto Semente Verde', 'Joinville, SC', 'Meio ambiente', 'Presencial', '4 horas por semana', 'Participe de oficinas sobre reciclagem, consumo consciente e cuidado com a natureza.'],
  ['Acolhimento em centro comunitário', 'Centro Comunitário Boa Vizinhança', 'Porto Alegre, RS', 'Assistência social', 'Presencial', '3 horas por semana', 'Receba visitantes e ajude a organizar as atividades do centro comunitário.'],
  ['Edição de vídeos para campanhas', 'Projeto Vozes que Inspiram', 'Remoto', 'Comunicação', 'Remoto', '3 horas por semana', 'Edite vídeos curtos para apresentar iniciativas sociais e suas histórias.'],
  ['Contação de histórias', 'Biblioteca Comunitária Páginas Vivas', 'Belo Horizonte, MG', 'Educação', 'Presencial', 'Sábados', 'Estimule a imaginação e o gosto pela leitura em encontros com crianças.'],
  ['Apoio em cozinha solidária', 'Associação Prato Compartilhado', 'São Paulo, SP', 'Assistência social', 'Presencial', 'Fins de semana', 'Colabore no preparo e na organização de refeições em uma cozinha comunitária.'],
  ['Mobilização para coleta seletiva', 'Coletivo Recicla Bairro', 'Rio de Janeiro, RJ', 'Meio ambiente', 'Híbrido', '2 horas por semana', 'Ajude moradores a conhecer os pontos de coleta e as boas práticas de separação de resíduos.'],
  ['Passeios com cães de abrigo', 'Abrigo Amigo Fiel', 'Florianópolis, SC', 'Animais', 'Presencial', 'Sábados', 'Proporcione passeios e atividades para cães acolhidos pelo abrigo.'],
  ['Tradução de materiais educativos', 'Instituto Conhecimento Livre', 'Remoto', 'Educação', 'Remoto', '3 horas por semana', 'Colabore na tradução e revisão de materiais de apoio a projetos de educação.'],
  ['Oficinas de arte e cultura', 'Espaço Cultural Novos Olhares', 'Joinville, SC', 'Educação', 'Presencial', '4 horas por semana', 'Compartilhe conhecimentos de desenho, pintura ou artesanato em oficinas comunitárias.'],
  ['Captação de parcerias locais', 'Rede Bairro Solidário', 'Curitiba, PR', 'Comunicação', 'Híbrido', '3 horas por semana', 'Ajude a aproximar negócios locais de projetos e ações da comunidade.'],
  ['Manutenção de horta comunitária', 'Projeto Cultivar Juntos', 'Porto Alegre, RS', 'Meio ambiente', 'Presencial', 'Sábados', 'Participe do plantio, da rega e dos cuidados com uma horta aberta à comunidade.'],
  ['Apoio em campanhas de agasalho', 'Associação Abraço Solidário', 'Belo Horizonte, MG', 'Assistência social', 'Presencial', 'Ação pontual', 'Organize pontos de arrecadação e a distribuição de roupas em campanhas de inverno.'],
  ['Revisão de conteúdo acessível', 'Instituto Acesso para Todos', 'Remoto', 'Comunicação', 'Remoto', '2 horas por semana', 'Contribua com a revisão de textos em linguagem simples para materiais de projetos sociais.'],
];

export const jobs = opportunities.map(([title, organization, location, cause, mode, hours, description], i) => ({
  id: i + 1, title, organization, location, cause, mode, hours, description,
  published: i < 3 ? 'Anunciada hoje' : i === 3 ? 'Anunciada há 1 dia' : `Anunciada há ${Math.ceil(i / 3)} dias`,
}));

export const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

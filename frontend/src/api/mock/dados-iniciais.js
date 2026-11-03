/**
 * Exemplos fictícios do modo demonstração. Não representam organizações ou vagas reais.
 * Formato igual ao que a API vai devolver (DER: oportunidade + organizacao + causa).
 */

export const ORGANIZACOES_INICIAIS = [
  'Instituto Novos Caminhos',
  'Associação Patas Amigas',
  'Projeto Primeiro Passo',
  'Rede Mesa Solidária',
  'Coletivo Mar Vivo',
  'Instituto Mãos que Transformam',
  'Casa Laços de Afeto',
  'Projeto Código do Amanhã',
  'Associação Raízes do Bairro',
  'Rede Conexão Solidária',
  'Instituto Brincar e Crescer',
  'Associação Juntos Pelo Bem',
  'Projeto Pontes Abertas',
  'Coletivo Olhares da Comunidade',
  'Banco Comunitário de Solidariedade',
  'Projeto Lar de Patas',
  'Instituto Aprender Juntos',
  'Instituto Semente Verde',
  'Centro Comunitário Boa Vizinhança',
  'Projeto Vozes que Inspiram',
  'Biblioteca Comunitária Páginas Vivas',
  'Associação Prato Compartilhado',
  'Coletivo Recicla Bairro',
  'Abrigo Amigo Fiel',
  'Instituto Conhecimento Livre',
  'Espaço Cultural Novos Olhares',
  'Rede Bairro Solidário',
  'Projeto Cultivar Juntos',
  'Associação Abraço Solidário',
  'Instituto Acesso para Todos',
].map((nome, i) => ({ id: i + 1, nome }));

/** A área da organização do modo demonstração age em nome desta organização. */
export const ORGANIZACAO_DEMONSTRACAO_ID = 1;

// [titulo, organizacaoId, cidade, uf, causa, descricao]
// prettier-ignore
const BASE = [
  ['Apoio escolar para crianças', 1, 'Joinville', 'SC', 'EDUCACAO', 'Apoie crianças no desenvolvimento da leitura, da escrita e da matemática em encontros de reforço escolar.'],
  ['Voluntário em cuidado animal', 2, 'São Paulo', 'SP', 'ANIMAIS', 'Ajude na rotina de acolhimento, alimentação e socialização de cães e gatos que aguardam uma família.'],
  ['Mentoria de carreira para jovens', 3, 'Joinville', 'SC', 'EDUCACAO', 'Compartilhe sua experiência profissional e ajude jovens a planejar os primeiros passos no mundo do trabalho.'],
  ['Apoio na distribuição de alimentos', 4, 'Curitiba', 'PR', 'ASSISTENCIA_SOCIAL', 'Participe da organização de alimentos e da entrega de cestas para famílias atendidas pelo projeto.'],
  ['Mutirão de limpeza de praias', 5, 'Florianópolis', 'SC', 'MEIO_AMBIENTE', 'Junte-se a um mutirão de coleta de resíduos e conscientização sobre a preservação do litoral.'],
  ['Designer voluntário', 6, 'São Paulo', 'SP', 'COMUNICACAO', 'Crie materiais de comunicação para campanhas sociais, eventos e projetos comunitários.'],
  ['Companhia e acolhimento de idosos', 7, 'Joinville', 'SC', 'ASSISTENCIA_SOCIAL', 'Compartilhe histórias, leituras e momentos de convivência com pessoas idosas.'],
  ['Oficinas de programação', 8, 'São Paulo', 'SP', 'EDUCACAO', 'Ensine fundamentos de tecnologia e programação para jovens em oficinas práticas.'],
  ['Plantio de árvores e hortas urbanas', 9, 'Belo Horizonte', 'MG', 'MEIO_AMBIENTE', 'Cuide de espaços verdes e contribua para hortas comunitárias com moradores do bairro.'],
  ['Comunicação e redes sociais', 10, 'Curitiba', 'PR', 'COMUNICACAO', 'Ajude a contar histórias de impacto e divulgar ações sociais nas redes sociais.'],
  ['Recreação infantil', 11, 'Curitiba', 'PR', 'EDUCACAO', 'Organize brincadeiras, jogos e atividades criativas em encontros com crianças da comunidade.'],
  ['Apoio em eventos beneficentes', 12, 'Joinville', 'SC', 'ASSISTENCIA_SOCIAL', 'Colabore na recepção, organização e orientação de visitantes em eventos solidários.'],
  ['Aulas de português para migrantes', 13, 'Florianópolis', 'SC', 'EDUCACAO', 'Facilite encontros de conversação e acolhimento para pessoas que estão aprendendo português.'],
  ['Fotografia para projetos sociais', 14, 'Rio de Janeiro', 'RJ', 'COMUNICACAO', 'Registre atividades de projetos sociais e ajude a dar visibilidade às iniciativas locais.'],
  ['Organização de doações', 15, 'São Paulo', 'SP', 'ASSISTENCIA_SOCIAL', 'Ajude na triagem e organização de roupas, brinquedos e materiais destinados a famílias.'],
  ['Apoio à adoção responsável', 16, 'Curitiba', 'PR', 'ANIMAIS', 'Apoie a organização de feiras de adoção e o acolhimento de visitantes.'],
  ['Professor de inglês voluntário', 17, 'Porto Alegre', 'RS', 'EDUCACAO', 'Prepare aulas de inglês acessíveis para jovens e adultos de projetos comunitários.'],
  ['Educação ambiental nas escolas', 18, 'Joinville', 'SC', 'MEIO_AMBIENTE', 'Participe de oficinas sobre reciclagem, consumo consciente e cuidado com a natureza.'],
  ['Acolhimento em centro comunitário', 19, 'Porto Alegre', 'RS', 'ASSISTENCIA_SOCIAL', 'Receba visitantes e ajude a organizar as atividades do centro comunitário.'],
  ['Edição de vídeos para campanhas', 20, 'Belo Horizonte', 'MG', 'COMUNICACAO', 'Edite vídeos curtos para apresentar iniciativas sociais e suas histórias.'],
  ['Contação de histórias', 21, 'Belo Horizonte', 'MG', 'EDUCACAO', 'Estimule a imaginação e o gosto pela leitura em encontros com crianças.'],
  ['Apoio em cozinha solidária', 22, 'São Paulo', 'SP', 'ASSISTENCIA_SOCIAL', 'Colabore no preparo e na organização de refeições em uma cozinha comunitária.'],
  ['Mobilização para coleta seletiva', 23, 'Rio de Janeiro', 'RJ', 'MEIO_AMBIENTE', 'Ajude moradores a conhecer os pontos de coleta e as boas práticas de separação de resíduos.'],
  ['Passeios com cães de abrigo', 24, 'Florianópolis', 'SC', 'ANIMAIS', 'Proporcione passeios e atividades para cães acolhidos pelo abrigo.'],
  ['Tradução de materiais educativos', 25, 'Rio de Janeiro', 'RJ', 'EDUCACAO', 'Colabore na tradução e revisão de materiais de apoio a projetos de educação.'],
  ['Oficinas de arte e cultura', 26, 'Joinville', 'SC', 'EDUCACAO', 'Compartilhe conhecimentos de desenho, pintura ou artesanato em oficinas comunitárias.'],
  ['Captação de parcerias locais', 27, 'Curitiba', 'PR', 'COMUNICACAO', 'Ajude a aproximar negócios locais de projetos e ações da comunidade.'],
  ['Manutenção de horta comunitária', 28, 'Porto Alegre', 'RS', 'MEIO_AMBIENTE', 'Participe do plantio, da rega e dos cuidados com uma horta aberta à comunidade.'],
  ['Apoio em campanhas de agasalho', 29, 'Belo Horizonte', 'MG', 'ASSISTENCIA_SOCIAL', 'Organize pontos de arrecadação e a distribuição de roupas em campanhas de inverno.'],
  ['Revisão de conteúdo acessível', 30, 'Joinville', 'SC', 'COMUNICACAO', 'Contribua com a revisão de textos em linguagem simples para materiais de projetos sociais.'],
];

const RUAS = [
  'Rua das Palmeiras',
  'Avenida Central',
  'Rua do Comércio',
  'Rua das Acácias',
  'Rua São José',
  'Avenida das Flores',
];

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Gera as oportunidades com datas relativas a "agora", para a demonstração
 * nunca mostrar ações que já passaram.
 */
export function gerarOportunidades(agora = new Date()) {
  return BASE.map(([titulo, organizacaoId, cidade, uf, causa, descricao], i) => {
    const inicio = new Date(agora.getTime() + ((i % 20) + 2) * DIA_MS);
    inicio.setHours(i % 2 === 0 ? 9 : 14, 0, 0, 0);
    const fim = new Date(inicio.getTime() + (2 + (i % 3)) * 60 * 60 * 1000);
    const diasAtras = i < 3 ? 0 : i === 3 ? 1 : Math.ceil(i / 3);
    const vagas = 4 + ((i * 3) % 12);
    return {
      id: i + 1,
      titulo,
      descricao,
      causa,
      organizacaoId,
      local: `${RUAS[i % RUAS.length]}, ${100 + i * 17} – Centro`,
      cidade,
      uf,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      vagas,
      vagasOcupadas: i % 4,
      status: 'ABERTA',
      criadoEm: new Date(agora.getTime() - diasAtras * DIA_MS).toISOString(),
    };
  });
}

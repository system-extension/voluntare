/** Papéis do backend (enum Papel) e para onde cada um vai depois de entrar. */
export const PAPEIS_ORGANIZACAO = ['GESTOR', 'COORDENADOR'];

export const ehDaOrganizacao = (usuario) => PAPEIS_ORGANIZACAO.includes(usuario?.papel);

export const ROTULO_PAPEL = {
  VOLUNTARIO: 'Voluntário',
  GESTOR: 'Gestor',
  COORDENADOR: 'Coordenador',
};

/**
 * Tela inicial de cada papel: a ONG vai para a sua área; o voluntário, para as vagas.
 * A página de apresentação (/) é só para quem não entrou.
 */
export const inicioDoPapel = (usuario) =>
  ehDaOrganizacao(usuario) ? '/organizacao' : '/oportunidades';

/**
 * Destino da marca e de "Página inicial": a apresentação é só para visitante; quem está logado,
 * em qualquer papel, cai na busca de vagas (a área da ONG tem o seu próprio item no menu).
 */
export const paginaInicial = (usuario) => (usuario ? '/oportunidades' : '/');

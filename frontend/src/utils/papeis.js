/** Papéis do backend (enum Papel) e para onde cada um vai depois de entrar. */
export const PAPEIS_ORGANIZACAO = ['GESTOR', 'COORDENADOR'];

export const ehDaOrganizacao = (usuario) => PAPEIS_ORGANIZACAO.includes(usuario?.papel);

export const ROTULO_PAPEL = {
  VOLUNTARIO: 'Voluntário',
  GESTOR: 'Gestor',
  COORDENADOR: 'Coordenador',
};

/** Tela inicial de cada papel: a ONG vai para a sua área; o voluntário, para as vagas. */
export const inicioDoPapel = (usuario) => (ehDaOrganizacao(usuario) ? '/organizacao' : '/');

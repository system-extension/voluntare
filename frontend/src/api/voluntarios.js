/** Perfil do voluntário e catálogo de habilidades (VoluntarioController). */
import { requisicao } from './cliente';

/** Catálogo público: as mesmas opções servem de habilidade ou de interesse. */
export function listarHabilidades() {
  return requisicao('/api/habilidades');
}

/** @returns {Promise<{id, nome, email, telefone, cidade, disponibilidade, habilidades: object[], interesses: object[]}>} */
export function buscarMeuPerfil() {
  return requisicao('/api/voluntarios/eu');
}

/** As listas substituem as atuais: mande sempre as duas. */
export function salvarMeuPerfil(dados) {
  return requisicao('/api/voluntarios/eu', { metodo: 'PUT', corpo: dados });
}

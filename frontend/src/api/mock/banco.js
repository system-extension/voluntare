/**
 * "Backend de mentira" do modo demonstração.
 * Imita as regras e os formatos que a API vai ter (mesmos nomes de campos e de status),
 * para que trocar para a API real não exija mudar nenhuma tela.
 * Os dados ficam só neste navegador (localStorage).
 */
import { ATRASO_MOCK_MS } from '../config';
import { ErroApi } from '../cliente';
import { normalizar } from '../../utils/texto';
import { CAUSAS, rotulo } from '../rotulos';
import {
  ORGANIZACOES_INICIAIS,
  ORGANIZACAO_DEMONSTRACAO_ID,
  gerarOportunidades,
} from './dados-iniciais';

const CHAVE = 'voluntare-demo-v1';
export const EVENTO_DADOS = 'voluntare:dados-alterados';

function inicial() {
  return { organizacoes: ORGANIZACOES_INICIAIS, oportunidades: gerarOportunidades() };
}

function ler() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(salvo?.oportunidades)) return salvo;
  } catch {
    /* recomeça com os exemplos */
  }
  return inicial();
}

let estado = ler();

function gravar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* modo privado ou armazenamento cheio: segue só em memória */
  }
  window.dispatchEvent(new Event(EVENTO_DADOS));
}

/** Apaga as alterações e volta aos exemplos. */
export function restaurarDemonstracao() {
  estado = inicial();
  gravar();
}

/** Espera um pouco (como a rede) e devolve uma cópia (como um JSON novo). */
export function responder(funcao) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(funcao()));
      } catch (erro) {
        reject(erro);
      }
    }, ATRASO_MOCK_MS);
  });
}

export const organizacoes = () => estado.organizacoes;
export const organizacaoDemonstracao = () => organizacaoPorId(ORGANIZACAO_DEMONSTRACAO_ID);

export function organizacaoPorId(id) {
  const organizacao = estado.organizacoes.find((o) => o.id === Number(id));
  if (!organizacao) throw new ErroApi(404, 'Organização não encontrada.');
  return organizacao;
}

/** Formato de saída da API: organização embutida e vagas disponíveis já calculadas. */
export function paraResposta(oportunidade) {
  const { organizacaoId, vagasOcupadas, ...resto } = oportunidade;
  const { id, nome } = organizacaoPorId(organizacaoId);
  return {
    ...resto,
    organizacao: { id, nome },
    vagasDisponiveis: Math.max(oportunidade.vagas - vagasOcupadas, 0),
  };
}

export const oportunidades = () => estado.oportunidades;

export function oportunidadePorId(id) {
  const oportunidade = estado.oportunidades.find((o) => o.id === Number(id));
  if (!oportunidade) throw new ErroApi(404, 'Oportunidade não encontrada.');
  return oportunidade;
}

/** Filtros da busca pública. */
export function filtrar(lista, { texto, local, causa, organizacaoId } = {}) {
  return lista.filter((o) => {
    const organizacao = organizacaoPorId(o.organizacaoId).nome;
    return (
      normalizar(`${o.titulo} ${organizacao} ${rotulo(CAUSAS, o.causa)} ${o.descricao}`).includes(
        normalizar(texto ?? ''),
      ) &&
      normalizar(`${o.local} ${o.cidade} ${o.uf}`).includes(normalizar(local ?? '')) &&
      (!causa || o.causa === causa) &&
      (!organizacaoId || o.organizacaoId === Number(organizacaoId))
    );
  });
}

export function paginar(lista, pagina = 1, tamanho = 15) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamanho));
  const atual = Math.min(Math.max(1, Number(pagina) || 1), totalPaginas);
  return {
    itens: lista.slice((atual - 1) * tamanho, atual * tamanho),
    pagina: atual,
    tamanho,
    total: lista.length,
    totalPaginas,
  };
}

/** Mesmas validações que o backend faz (DER: vagas > 0, fim > início). */
function validar(dados) {
  const campos = [];
  if (!dados.titulo?.trim()) campos.push({ campo: 'titulo', mensagem: 'Informe o título.' });
  if (!(Number(dados.vagas) > 0)) campos.push({ campo: 'vagas', mensagem: 'Informe as vagas.' });
  if (!(new Date(dados.fim) > new Date(dados.inicio)))
    campos.push({ campo: 'fim', mensagem: 'O término precisa ser depois do início.' });
  if (campos.length) throw new ErroApi(400, 'Revise os campos indicados.', campos);
}

export function criarOportunidade(dados) {
  validar(dados);
  const id = Math.max(0, ...estado.oportunidades.map((o) => o.id)) + 1;
  const nova = {
    ...dados,
    id,
    organizacaoId: ORGANIZACAO_DEMONSTRACAO_ID,
    vagas: Number(dados.vagas),
    vagasOcupadas: 0,
    status: 'ABERTA',
    criadoEm: new Date().toISOString(),
  };
  estado = { ...estado, oportunidades: [nova, ...estado.oportunidades] };
  gravar();
  return nova;
}

export function atualizarOportunidade(id, dados) {
  const atual = oportunidadePorId(id);
  if (atual.status !== 'ABERTA')
    throw new ErroApi(409, 'Só é possível editar oportunidades abertas.');
  validar(dados);
  if (Number(dados.vagas) < atual.vagasOcupadas)
    throw new ErroApi(409, 'As vagas não podem ficar abaixo dos voluntários já confirmados.');
  const atualizada = { ...atual, ...dados, vagas: Number(dados.vagas) };
  substituir(atualizada);
  return atualizada;
}

/** ABERTA → ENCERRADA ou CANCELADA. Os dois são finais (DER). */
export function mudarStatus(id, status) {
  const atual = oportunidadePorId(id);
  if (atual.status !== 'ABERTA')
    throw new ErroApi(409, 'Só oportunidades abertas podem ser encerradas ou canceladas.');
  const atualizada = { ...atual, status };
  substituir(atualizada);
  return atualizada;
}

function substituir(oportunidade) {
  estado = {
    ...estado,
    oportunidades: estado.oportunidades.map((o) => (o.id === oportunidade.id ? oportunidade : o)),
  };
  gravar();
}

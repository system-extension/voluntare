import { CAUSAS, UFS } from '../../api/rotulos';
import { cidadeOficial } from '../../dados/municipios';

export const MAX_VAGAS = 20;

export const FORMULARIO_VAZIO = {
  titulo: '',
  causa: 'EDUCACAO',
  vagas: '1',
  local: '',
  cidade: '',
  uf: '',
  data: '',
  horaInicio: '',
  horaFim: '',
  descricao: '',
  atividades: '',
  requisitos: '',
  responsavelId: '',
  habilidadeIds: [],
};

const dois = (n) => String(n).padStart(2, '0');

/** Data (aaaa-mm-dd) e hora (hh:mm) de agora, no fuso do navegador, para comparar com os campos. */
export function agoraLocal(d = new Date()) {
  return {
    data: `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`,
    hora: `${dois(d.getHours())}:${dois(d.getMinutes())}`,
  };
}

/** Mesma regra do backend (pendenciasDoPeriodo): um dia só, término depois do início. */
export function erroDoPeriodo(horaInicio, horaFim) {
  if (horaInicio && horaFim && horaFim <= horaInicio)
    return 'O término precisa ser depois do início.';
  return undefined;
}

/** Cidade precisa ser uma das cidades da UF escolhida (quando a lista já carregou). */
function erroDaCidade(form, municipios) {
  if (!form.cidade.trim()) return undefined;
  if (!form.uf) return 'Escolha o estado antes da cidade.';
  if (municipios && !cidadeOficial(municipios, form.uf, form.cidade))
    return `Escolha uma cidade de ${form.uf} na lista.`;
  return undefined;
}

/**
 * Mesmas regras do backend, para quem publica ver o erro antes de enviar (o backend confere de novo).
 * Devolve { campo: mensagem } (vazio quando está tudo certo).
 */
export function validarOportunidade(form, { municipios, agora = agoraLocal() } = {}) {
  const erros = {};
  if (!form.titulo.trim()) erros.titulo = 'Informe o título da oportunidade.';
  if (!CAUSAS.some((c) => c.valor === form.causa)) erros.causa = 'Selecione uma causa.';
  const vagas = Number(form.vagas);
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > MAX_VAGAS)
    erros.vagas = `Informe de 1 a ${MAX_VAGAS} vagas.`;
  if (!UFS.includes(form.uf)) erros.uf = 'Escolha o estado.';
  if (!form.cidade.trim()) erros.cidade = 'Escolha a cidade.';
  else if (erroDaCidade(form, municipios)) erros.cidade = erroDaCidade(form, municipios);
  if (!form.local.trim()) erros.local = 'Informe o endereço da ação.';
  if (!form.data) erros.data = 'Informe a data da ação.';
  else if (form.data < agora.data) erros.data = 'A data não pode estar no passado.';
  if (!form.horaInicio) erros.horaInicio = 'Informe o horário de início.';
  else if (form.data === agora.data && form.horaInicio <= agora.hora)
    erros.horaInicio = 'Para hoje, o início precisa ser depois do horário atual.';
  if (!form.horaFim) erros.horaFim = 'Informe o horário de término.';
  else if (erroDoPeriodo(form.horaInicio, form.horaFim))
    erros.horaFim = erroDoPeriodo(form.horaInicio, form.horaFim);
  if (form.descricao.trim().length < 40)
    erros.descricao = 'Descreva a oportunidade em pelo menos 40 caracteres.';
  return erros;
}

/** Rascunho: só o título é obrigatório; o que já foi preenchido ainda precisa fazer sentido. */
export function validarRascunho(form, { municipios } = {}) {
  const erros = {};
  if (!form.titulo.trim()) erros.titulo = 'Informe ao menos o título para salvar o rascunho.';
  const vagas = Number(form.vagas);
  if (form.vagas && (!Number.isInteger(vagas) || vagas < 1 || vagas > MAX_VAGAS))
    erros.vagas = `Informe de 1 a ${MAX_VAGAS} vagas.`;
  if (erroDaCidade(form, municipios)) erros.cidade = erroDaCidade(form, municipios);
  if (erroDoPeriodo(form.horaInicio, form.horaFim))
    erros.horaFim = erroDoPeriodo(form.horaInicio, form.horaFim);
  return erros;
}

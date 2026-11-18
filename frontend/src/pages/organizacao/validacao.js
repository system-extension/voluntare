import { CAUSAS, UFS } from '../../api/rotulos';

export const FORMULARIO_VAZIO = {
  titulo: '',
  causa: 'EDUCACAO',
  vagas: '1',
  local: '',
  cidade: '',
  uf: 'SC',
  data: '',
  horaInicio: '',
  horaFim: '',
  descricao: '',
  atividades: '',
  requisitos: '',
  responsavelId: '',
  habilidadeIds: [],
};

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Mesmas regras do DER e do backend, para quem publica ver o erro antes de enviar.
 * Devolve { campo: mensagem } (vazio quando está tudo certo).
 */
export function validarOportunidade(form) {
  const erros = {};
  if (!form.titulo.trim()) erros.titulo = 'Informe o título da oportunidade.';
  if (!CAUSAS.some((c) => c.valor === form.causa)) erros.causa = 'Selecione uma causa.';
  const vagas = Number(form.vagas);
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 999)
    erros.vagas = 'Informe de 1 a 999 vagas.';
  if (!form.local.trim()) erros.local = 'Informe o endereço da ação.';
  if (!form.cidade.trim()) erros.cidade = 'Informe a cidade.';
  if (!UFS.includes(form.uf)) erros.uf = 'Selecione o estado.';
  if (!form.data) erros.data = 'Informe a data da ação.';
  else if (form.data < hoje()) erros.data = 'A data não pode estar no passado.';
  if (!form.horaInicio) erros.horaInicio = 'Informe o horário de início.';
  if (!form.horaFim) erros.horaFim = 'Informe o horário de término.';
  else if (form.horaInicio && form.horaFim <= form.horaInicio)
    erros.horaFim = 'O término precisa ser depois do início.';
  if (form.descricao.trim().length < 40)
    erros.descricao = 'Descreva a oportunidade em pelo menos 40 caracteres.';
  return erros;
}

/** Rascunho: só o título é obrigatório; o horário, se preenchido, ainda precisa fazer sentido. */
export function validarRascunho(form) {
  const erros = {};
  if (!form.titulo.trim()) erros.titulo = 'Informe ao menos o título para salvar o rascunho.';
  if (form.horaInicio && form.horaFim && form.horaFim <= form.horaInicio)
    erros.horaFim = 'O término precisa ser depois do início.';
  return erros;
}

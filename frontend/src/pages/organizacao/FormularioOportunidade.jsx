import { useRef, useState } from 'react';
import { ArrowLeft, Check, MapPin, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buscarParaGestao,
  publicarOportunidade,
  salvarOportunidade,
} from '../../api/oportunidades';
import { buscarMinhaOrganizacao, listarEquipe } from '../../api/organizacoes';
import { listarHabilidades } from '../../api/voluntarios';
import { CAUSAS, UFS, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';
import { formatarPeriodo, juntarDataHora, separarDataHora } from '../../utils/datas';
import { FORMULARIO_VAZIO, validarOportunidade, validarRascunho } from './validacao';
import './organizacao.css';

/** Converte a oportunidade da API nos campos do formulário (data e horários separados). */
function paraFormulario(oportunidade) {
  const inicio = separarDataHora(oportunidade.inicio);
  const fim = separarDataHora(oportunidade.fim);
  // rascunho pode vir com quase tudo vazio
  return {
    ...FORMULARIO_VAZIO,
    titulo: oportunidade.titulo,
    causa: oportunidade.causa ?? FORMULARIO_VAZIO.causa,
    vagas: oportunidade.vagas != null ? String(oportunidade.vagas) : FORMULARIO_VAZIO.vagas,
    local: oportunidade.local ?? '',
    cidade: oportunidade.cidade ?? '',
    uf: oportunidade.uf ?? FORMULARIO_VAZIO.uf,
    data: inicio.data,
    horaInicio: inicio.hora,
    horaFim: fim.hora,
    descricao: oportunidade.descricao ?? '',
    atividades: oportunidade.atividades ?? '',
    requisitos: oportunidade.requisitos ?? '',
    responsavelId: oportunidade.responsavel?.id ?? '',
    habilidadeIds: (oportunidade.habilidades ?? []).map((h) => h.id),
  };
}

/** Rota /organizacao/nova e /organizacao/:id/editar. */
export default function FormularioOportunidade() {
  const { id } = useParams();
  useTitulo(id ? 'Editar vaga' : 'Anunciar uma vaga');
  const { usuario } = useConta();
  const gestor = usuario?.papel === 'GESTOR';
  const organizacao = useCarregar(buscarMinhaOrganizacao);
  const catalogo = useCarregar(listarHabilidades);
  // só o gestor escolhe o responsável (RN-17)
  const equipe = useCarregar(() => (gestor ? listarEquipe() : Promise.resolve([])), [gestor]);
  const existente = useCarregar(() => (id ? buscarParaGestao(id) : Promise.resolve(null)), [id]);

  if (existente.erro) return <ErroCarregamento erro={existente.erro} />;
  if (!organizacao.dados || existente.carregando) return <Carregando />;
  if (existente.dados && !['RASCUNHO', 'ABERTA'].includes(existente.dados.status))
    return (
      <ErroCarregamento erro={{ message: 'Só rascunhos e vagas abertas podem ser editados.' }} />
    );

  return (
    <Editor
      key={id ?? 'nova'}
      id={id}
      status={existente.dados?.status}
      organizacao={organizacao.dados}
      catalogo={catalogo.dados ?? []}
      equipe={(equipe.dados ?? []).filter((m) => m.ativo)}
      gestor={gestor}
      inicial={existente.dados ? paraFormulario(existente.dados) : FORMULARIO_VAZIO}
    />
  );
}

/** Mesma regra do backend (pendenciasDoPeriodo): a ação acontece num dia só, término depois do início. */
function erroDoPeriodo(horaInicio, horaFim) {
  if (horaInicio && horaFim && horaFim <= horaInicio)
    return 'O término precisa ser depois do início.';
  return undefined;
}

/** "Duração: 2h30" quando o período é válido; ajuda a perceber um horário digitado errado. */
function duracao(horaInicio, horaFim) {
  if (!horaInicio || !horaFim || horaFim <= horaInicio) return undefined;
  const minutos = (texto) => Number(texto.slice(0, 2)) * 60 + Number(texto.slice(3, 5));
  const total = minutos(horaFim) - minutos(horaInicio);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `Duração: ${h ? `${h}h` : ''}${m ? String(m).padStart(h ? 2 : 1, '0') + (h ? '' : ' min') : ''}`;
}

function Editor({ id, status, organizacao, catalogo, equipe, gestor, inicial }) {
  const navegar = useNavigate();
  const [form, setForm] = useState(inicial);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);

  const voltar = () => navegar('/organizacao');
  const aberta = status === 'ABERTA';

  function atualizar(e) {
    const { name, value } = e.target;
    const novo = { ...form, [name]: value };
    setForm(novo);
    setErros((atual) => {
      const erros = { ...atual, [name]: undefined };
      // O horário é conferido na hora, não só ao publicar: com os dois preenchidos,
      // um término antes do início já aparece em vermelho enquanto a pessoa escolhe.
      if (name === 'horaInicio' || name === 'horaFim') {
        erros.horaFim = erroDoPeriodo(novo.horaInicio, novo.horaFim);
      }
      return erros;
    });
  }

  function focarPrimeiroErro() {
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
  }

  // rascunho: só o título é obrigatório (RN-20); publicar exige o anúncio completo
  async function enviar(e, comoRascunho = false) {
    e.preventDefault();
    const novosErros = comoRascunho ? validarRascunho(form) : validarOportunidade(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return focarPrimeiroErro();

    const texto = (v) => v.trim() || null;
    const periodo = form.data && form.horaInicio && form.horaFim;
    const dados = {
      id,
      titulo: form.titulo.trim(),
      causa: form.causa || null,
      vagas: form.vagas ? Number(form.vagas) : null,
      local: texto(form.local),
      cidade: texto(form.cidade),
      uf: form.uf || null,
      inicio: periodo ? juntarDataHora(form.data, form.horaInicio) : null,
      fim: periodo ? juntarDataHora(form.data, form.horaFim) : null,
      descricao: texto(form.descricao),
      atividades: texto(form.atividades),
      requisitos: texto(form.requisitos),
      // na edição a lista substitui a atual: sempre mandar, senão as habilidades somem
      habilidadeIds: form.habilidadeIds,
      responsavelId: gestor && form.responsavelId ? form.responsavelId : null,
      rascunho: comoRascunho,
    };

    setEnviando(true);
    try {
      const salva = await salvarOportunidade(dados);
      if (status === 'RASCUNHO' && !comoRascunho) await publicarOportunidade(salva.id);
      navegar('/organizacao', {
        state: {
          aviso: comoRascunho
            ? 'Rascunho salvo. Ele não aparece na busca até ser publicado.'
            : aberta
              ? 'Vaga atualizada na busca.'
              : 'Vaga publicada na busca.',
        },
      });
    } catch (erro) {
      setErroEnvio(erro.message);
      const nomes = { inicio: 'horaInicio', fim: 'horaFim' };
      const doServidor = Object.fromEntries(
        (erro.campos ?? []).map((c) => [nomes[c.campo] ?? c.campo, c.mensagem]),
      );
      setErros(doServidor);
      focarPrimeiroErro();
    } finally {
      setEnviando(false);
    }
  }

  const alternarHabilidade = (habilidadeId) =>
    setForm((atual) => {
      const tem = atual.habilidadeIds.includes(habilidadeId);
      if (!tem && atual.habilidadeIds.length >= 10) return atual;
      return {
        ...atual,
        habilidadeIds: tem
          ? atual.habilidadeIds.filter((h) => h !== habilidadeId)
          : [...atual.habilidadeIds, habilidadeId],
      };
    });

  function campo(
    name,
    label,
    { type = 'text', placeholder, maxLength = 120, options, dica, extra = {} } = {},
  ) {
    const descricao = [erros[name] && `erro-${name}`, dica && !erros[name] && `dica-${name}`]
      .filter(Boolean)
      .join(' ');
    const attrs = {
      id: `ong-${name}`,
      name,
      value: form[name],
      onChange: atualizar,
      'aria-invalid': !!erros[name],
      'aria-describedby': descricao || undefined,
      ...extra,
    };
    return (
      <div className="ong-field">
        <label htmlFor={attrs.id}>{label}</label>
        {options ? (
          <select {...attrs}>
            {options.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea {...attrs} rows={5} maxLength={maxLength} placeholder={placeholder} />
        ) : (
          <input
            {...attrs}
            type={type}
            maxLength={type === 'text' ? maxLength : undefined}
            placeholder={placeholder}
            {...(type === 'number' ? { min: 1, max: 999, step: 1 } : {})}
          />
        )}
        {dica && !erros[name] && (
          <span className="ong-field-hint" id={`dica-${name}`}>
            {dica}
          </span>
        )}
        {erros[name] && (
          <span className="ong-field-error" id={`erro-${name}`}>
            {erros[name]}
          </span>
        )}
      </div>
    );
  }

  const ufs = UFS.map((uf) => ({ valor: uf, rotulo: uf }));
  const periodo =
    form.data && form.horaInicio && form.horaFim && form.horaFim > form.horaInicio
      ? formatarPeriodo(
          juntarDataHora(form.data, form.horaInicio),
          juntarDataHora(form.data, form.horaFim),
        )
      : 'Data e horário';

  return (
    <section className="ong-page ong-editor">
      <button className="text-button" onClick={voltar}>
        <ArrowLeft size={17} />
        Voltar às minhas vagas
      </button>
      <div className="ong-editor-heading">
        <div className="ong-eyebrow">Anunciar uma oportunidade</div>
        <h1>
          {aberta
            ? 'Editar vaga'
            : id
              ? 'Continuar rascunho'
              : 'Encontre quem quer fazer a diferença.'}
        </h1>
        <p>Apresente sua causa e conte como os voluntários podem ajudar.</p>
      </div>
      <form ref={formRef} onSubmit={enviar} noValidate className="ong-form-layout">
        <div className="ong-form-fields">
          <section className="ong-form-section">
            <h2>
              <span>1</span> Sobre a organização
            </h2>
            <div className="ong-field">
              <label htmlFor="ong-organizacao">Organização</label>
              <input id="ong-organizacao" value={organizacao.nome} readOnly />
              <span className="ong-form-footnote">
                As vagas são publicadas em nome da sua organização.
              </span>
            </div>
          </section>

          <section className="ong-form-section">
            <h2>
              <span>2</span> A oportunidade
            </h2>
            {campo('titulo', 'Título da vaga', {
              placeholder: 'Ex.: Voluntário para reforço escolar',
            })}
            <div className="ong-field-grid">
              {campo('causa', 'Causa', { options: CAUSAS })}
              {campo('vagas', 'Número de vagas', { type: 'number' })}
            </div>
          </section>

          <section className="ong-form-section">
            <h2>
              <span>3</span> Local, data e horário
            </h2>
            {campo('local', 'Endereço', {
              placeholder: 'Ex.: Rua das Palmeiras, 120 – Centro',
              maxLength: 200,
            })}
            <div className="ong-field-grid">
              {campo('cidade', 'Cidade', { placeholder: 'Ex.: Joinville', maxLength: 100 })}
              {campo('uf', 'Estado', { options: ufs })}
            </div>
            {campo('data', 'Data da ação', { type: 'date' })}
            <div className="ong-field-grid">
              {campo('horaInicio', 'Início', { type: 'time' })}
              {campo('horaFim', 'Término', {
                type: 'time',
                // min: o seletor do navegador já sugere horários depois do início.
                extra: { min: form.horaInicio || undefined },
                dica: duracao(form.horaInicio, form.horaFim),
              })}
            </div>
          </section>

          <section className="ong-form-section">
            <h2>
              <span>4</span> Atividades e expectativas
            </h2>
            {campo('descricao', 'Descrição da oportunidade', {
              type: 'textarea',
              maxLength: 5000,
              placeholder:
                'Apresente o projeto, as atividades e o que espera dos voluntários. Mínimo de 40 caracteres.',
            })}
            {campo('atividades', 'O que os voluntários vão fazer (opcional)', {
              type: 'textarea',
              maxLength: 2000,
            })}
            {campo('requisitos', 'Requisitos (opcional)', {
              type: 'textarea',
              maxLength: 2000,
              placeholder: 'Ex.: pontualidade, gostar de crianças',
            })}
          </section>

          <section className="ong-form-section">
            <h2>
              <span>5</span> Habilidades desejadas e responsável
            </h2>
            <fieldset className="ong-habilidades">
              <legend>Habilidades desejadas (até 10, opcional)</legend>
              <p className="ong-form-footnote">
                Ajudam o voluntário a se encontrar na vaga, mas não impedem ninguém de se
                candidatar.
              </p>
              <div>
                {catalogo.map((h) => (
                  <button
                    type="button"
                    key={h.id}
                    aria-pressed={form.habilidadeIds.includes(h.id)}
                    onClick={() => alternarHabilidade(h.id)}
                  >
                    {h.nome}
                  </button>
                ))}
              </div>
              {erros.habilidadeIds && (
                <span className="ong-field-error">{erros.habilidadeIds}</span>
              )}
            </fieldset>
            {gestor ? (
              campo('responsavelId', 'Responsável pela vaga', {
                options: [
                  { valor: '', rotulo: id ? 'Manter o atual' : 'Eu mesmo' },
                  ...equipe.map((m) => ({
                    valor: m.id,
                    rotulo: `${m.nome} (${m.papel === 'GESTOR' ? 'gestor' : 'coordenador'})`,
                  })),
                ],
                dica: 'Quem aceita os candidatos e registra a presença. O gestor pode agir em qualquer vaga.',
              })
            ) : (
              <p className="ong-form-footnote">
                O responsável pela vaga é definido pelo gestor da organização.
              </p>
            )}
          </section>

          {(erroEnvio || Object.values(erros).some(Boolean)) && (
            <p role="alert" className="ong-error-banner">
              {erroEnvio || 'Revise os campos indicados antes de continuar.'}
            </p>
          )}
          <div className="ong-form-actions">
            <button type="button" className="text-button" onClick={voltar}>
              Cancelar
            </button>
            {!aberta && (
              <button
                type="button"
                className="ong-outline-button"
                disabled={enviando}
                onClick={(e) => enviar(e, true)}
              >
                Salvar rascunho
              </button>
            )}
            <button type="submit" className="primary-button" disabled={enviando}>
              {aberta ? 'Salvar e atualizar vaga' : 'Publicar vaga'}
            </button>
          </div>
          <p className="ong-form-footnote">
            Ao publicar, a vaga aparece na busca e passa a receber candidaturas.
          </p>
        </div>

        <aside className="ong-preview">
          <div className="ong-preview-label">
            <Search size={17} aria-hidden="true" />
            Prévia do anúncio
          </div>
          <article>
            <span className="ong-preview-cause">{rotulo(CAUSAS, form.causa)}</span>
            <h2>{form.titulo || 'Título da oportunidade'}</h2>
            <p>{organizacao.nome}</p>
            <p className="inline-icon">
              <MapPin size={16} />
              {form.cidade ? `${form.cidade}, ${form.uf}` : 'Cidade, estado'}
            </p>
            <div className="tags">
              <span>{periodo}</span>
              <span>{form.vagas ? `${form.vagas} vaga(s)` : 'Vagas'}</span>
            </div>
            <p className="ong-preview-description">
              {form.descricao ||
                'A descrição da sua oportunidade aparecerá aqui. Seja claro sobre as atividades e o impacto do trabalho voluntário.'}
            </p>
          </article>
          <div className="ong-writing-tip">
            <Check size={19} />
            <p>
              <strong>Um bom anúncio aproxima pessoas.</strong> Explique as atividades, os horários
              e o apoio oferecido pela sua equipe.
            </p>
          </div>
        </aside>
      </form>
    </section>
  );
}

import { useRef, useState } from 'react';
import { ArrowLeft, Check, MapPin, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { buscarOportunidade, salvarOportunidade } from '../../api/oportunidades';
import { buscarMinhaOrganizacao } from '../../api/organizacoes';
import { CAUSAS, UFS, rotulo } from '../../api/rotulos';
import Carregando from '../../components/ui/Carregando';
import ErroCarregamento from '../../components/ui/ErroCarregamento';
import useCarregar from '../../hooks/useCarregar';
import useTitulo from '../../hooks/useTitulo';
import { formatarPeriodo, juntarDataHora, separarDataHora } from '../../utils/datas';
import { FORMULARIO_VAZIO, validarOportunidade } from './validacao';
import './organizacao.css';

/** Converte a oportunidade da API nos campos do formulário (data e horários separados). */
function paraFormulario(oportunidade) {
  const inicio = separarDataHora(oportunidade.inicio);
  const fim = separarDataHora(oportunidade.fim);
  return {
    titulo: oportunidade.titulo,
    causa: oportunidade.causa,
    vagas: String(oportunidade.vagas),
    local: oportunidade.local,
    cidade: oportunidade.cidade,
    uf: oportunidade.uf,
    data: inicio.data,
    horaInicio: inicio.hora,
    horaFim: fim.hora,
    descricao: oportunidade.descricao,
  };
}

/** Rota /organizacao/nova e /organizacao/:id/editar. */
export default function FormularioOportunidade() {
  const { id } = useParams();
  useTitulo(id ? 'Editar vaga' : 'Anunciar uma vaga');
  const organizacao = useCarregar(buscarMinhaOrganizacao);
  const existente = useCarregar(() => (id ? buscarOportunidade(id) : Promise.resolve(null)), [id]);

  if (existente.erro) return <ErroCarregamento erro={existente.erro} />;
  if (!organizacao.dados || existente.carregando) return <Carregando />;
  if (existente.dados && existente.dados.status !== 'ABERTA')
    return <ErroCarregamento erro={{ message: 'Só é possível editar oportunidades abertas.' }} />;

  return (
    <Editor
      key={id ?? 'nova'}
      id={id}
      organizacao={organizacao.dados}
      inicial={existente.dados ? paraFormulario(existente.dados) : FORMULARIO_VAZIO}
    />
  );
}

function Editor({ id, organizacao, inicial }) {
  const navegar = useNavigate();
  const [form, setForm] = useState(inicial);
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState('');
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);

  const voltar = () => navegar('/organizacao');

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [name]: undefined }));
  }

  function focarPrimeiroErro() {
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
  }

  async function enviar(e) {
    e.preventDefault();
    const novosErros = validarOportunidade(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return focarPrimeiroErro();

    setEnviando(true);
    try {
      await salvarOportunidade({
        id,
        titulo: form.titulo.trim(),
        causa: form.causa,
        vagas: Number(form.vagas),
        local: form.local.trim(),
        cidade: form.cidade.trim(),
        uf: form.uf,
        inicio: juntarDataHora(form.data, form.horaInicio),
        fim: juntarDataHora(form.data, form.horaFim),
        descricao: form.descricao.trim(),
      });
      navegar('/organizacao', {
        state: { aviso: id ? 'Vaga atualizada na busca.' : 'Vaga publicada na busca.' },
      });
    } catch (erro) {
      setErroEnvio(erro.message);
      const doServidor = Object.fromEntries((erro.campos ?? []).map((c) => [c.campo, c.mensagem]));
      setErros(doServidor);
      focarPrimeiroErro();
    } finally {
      setEnviando(false);
    }
  }

  function campo(name, label, { type = 'text', placeholder, maxLength = 120, options } = {}) {
    const attrs = {
      id: `ong-${name}`,
      name,
      value: form[name],
      onChange: atualizar,
      'aria-invalid': !!erros[name],
      'aria-describedby': erros[name] ? `erro-${name}` : undefined,
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
        <h1>{id ? 'Editar vaga' : 'Encontre quem quer fazer a diferença.'}</h1>
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
              {campo('horaFim', 'Término', { type: 'time' })}
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
            <button type="submit" className="primary-button" disabled={enviando}>
              {id ? 'Salvar e atualizar vaga' : 'Publicar vaga'}
            </button>
          </div>
          <p className="ong-form-footnote">
            Ao publicar, a vaga aparecerá somente na busca local deste navegador.
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

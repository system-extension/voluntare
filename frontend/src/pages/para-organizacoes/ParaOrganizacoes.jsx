import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  MapPin,
  Megaphone,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useConta from '../../hooks/useConta';
import useTitulo from '../../hooks/useTitulo';
import { ehDaOrganizacao } from '../../utils/papeis';
import './para-organizacoes.css';

const PASSOS = [
  {
    titulo: 'Cadastre a organização',
    texto: 'Nome, cidade e um contato. Você entra como gestor logo em seguida.',
  },
  {
    titulo: 'Publique a vaga',
    texto: 'Descreva a atividade, a data, o local e quantas pessoas precisa.',
  },
  {
    titulo: 'Acompanhe os voluntários',
    texto: 'Escolha quem participa e registre a presença depois da atividade.',
  },
];

/** Só o que o MVP já faz: nada de números ou depoimentos inventados. */
const RECURSOS = [
  {
    icone: Megaphone,
    titulo: 'Vagas completas, prontas para encontrar',
    texto:
      'Causa, endereço, data, horário, número de vagas e as habilidades que ajudam na atividade. Salve como rascunho e publique quando estiver tudo certo.',
  },
  {
    icone: UserCheck,
    titulo: 'Você escolhe quem participa',
    texto:
      'Veja cada candidatura com as habilidades e os interesses da pessoa. Aceite ou recuse; o Voluntare não deixa passar do número de vagas.',
  },
  {
    icone: CalendarCheck,
    titulo: 'Presença e horas registradas',
    texto:
      'Depois da atividade, marque quem compareceu e quantas horas fez. O voluntário fica com o histórico da participação.',
  },
  {
    icone: Users,
    titulo: 'Um responsável por vaga',
    texto:
      'Cada vaga tem uma pessoa da equipe como contato. Os voluntários sabem com quem falar, e cada um cuida das suas vagas.',
  },
];

/** Rota /para-organizacoes: apresenta o Voluntare para as ONGs antes do cadastro. */
export default function ParaOrganizacoes() {
  useTitulo('Para organizações');
  const { usuario } = useConta();
  const daOrganizacao = ehDaOrganizacao(usuario);

  const chamada = daOrganizacao ? (
    <Link className="primary-button" to="/organizacao">
      Ir para a área da organização <ArrowRight size={20} />
    </Link>
  ) : (
    <Link className="primary-button" to="/cadastro-organizacao">
      Cadastrar minha organização <ArrowRight size={20} />
    </Link>
  );

  return (
    <div className="ong-landing">
      <section className="ong-hero" aria-labelledby="ong-hero-titulo">
        <div className="ong-hero-texto">
          <p className="ong-sobretitulo">Voluntare para organizações</p>
          <h1 id="ong-hero-titulo">Encontre voluntários para a sua causa</h1>
          <p className="ong-hero-descricao">
            Publique as vagas da sua ONG, receba candidaturas e acompanhe cada participação em um só
            lugar.
          </p>
          <div className="ong-acoes">
            {chamada}
            {!usuario && (
              <Link
                className="ong-link-secundario"
                to="/entrar"
                state={{ de: { pathname: '/organizacao' } }}
              >
                Já tenho conta
              </Link>
            )}
          </div>
          {usuario && !daOrganizacao && (
            <p className="ong-aviso">
              Você está conectado como voluntário. Para cadastrar uma organização, saia e use outro
              e-mail.
            </p>
          )}
        </div>

        {/* Ilustração feita com a própria interface: um cartão de vaga como o voluntário vê. */}
        <div className="ong-vitrine" aria-hidden="true">
          <div className="ong-vitrine-cartao">
            <span className="ong-vitrine-causa">Educação</span>
            <strong>Apoio escolar para crianças</strong>
            <span className="ong-vitrine-org">Sua organização</span>
            <span className="ong-vitrine-local">
              <MapPin size={16} /> Joinville, SC · sábado, 9h às 12h
            </span>
            <div className="ong-vitrine-vagas">
              <div className="ong-vitrine-barra">
                <span style={{ width: '60%' }} />
              </div>
              <span>3 de 5 vagas preenchidas</span>
            </div>
          </div>
          <div className="ong-vitrine-candidato">
            <span className="ong-vitrine-avatar">M</span>
            <span>
              <strong>Nova candidatura</strong>
              <small>Leitura e reforço escolar</small>
            </span>
            <span className="ong-vitrine-aceitar">Aceitar</span>
          </div>
        </div>
      </section>

      <section className="ong-secao" aria-labelledby="ong-passos-titulo">
        <h2 id="ong-passos-titulo">Como funciona</h2>
        <ol className="ong-passos">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo}>
              <span className="ong-passo-numero">{i + 1}</span>
              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ong-secao ong-secao-clara" aria-labelledby="ong-recursos-titulo">
        <h2 id="ong-recursos-titulo">
          Tudo o que a sua equipe precisa para organizar o voluntariado
        </h2>
        <div className="ong-recursos">
          {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
            <article key={titulo} className="ong-recurso">
              <span className="ong-recurso-icone">
                <Icone size={24} />
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ong-final" aria-labelledby="ong-final-titulo">
        <ClipboardList size={32} aria-hidden="true" />
        <h2 id="ong-final-titulo">Pronto para publicar a primeira vaga?</h2>
        <p>O cadastro leva poucos minutos.</p>
        {chamada}
      </section>
    </div>
  );
}

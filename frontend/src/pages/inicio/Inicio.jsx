import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BarraBusca from '../../components/busca/BarraBusca';
import Logo from '../../components/ui/Logo';
import useTitulo from '../../hooks/useTitulo';
import { caminhoBusca } from '../../utils/rotas';
import './inicio.css';

const EM_ALTA = [
  {
    titulo: 'Buscas em alta',
    termos: ['Educação', 'Meio ambiente', 'Animais', 'Assistência social'],
  },
  {
    titulo: 'Oportunidades em alta',
    termos: ['Apoio escolar', 'Mentoria', 'Comunicação', 'Doações'],
  },
  {
    titulo: 'Locais em alta',
    termos: ['Joinville', 'São Paulo', 'Curitiba', 'Florianópolis'],
    local: true,
  },
];

export default function Inicio() {
  useTitulo('Encontre sua próxima oportunidade');
  const navegar = useNavigate();
  const buscar = (filtros) => navegar(caminhoBusca(filtros));

  return (
    <>
      <BarraBusca />
      <section className="welcome" aria-labelledby="welcome-title">
        <Logo tamanho="grande" />
        <h1 id="welcome-title">Sua próxima vaga começa aqui</h1>
        <p>Encontre uma oportunidade de voluntariado e faça parte de uma causa.</p>
        <button className="primary-button start-button" onClick={() => buscar()}>
          Começar <ArrowRight size={23} />
        </button>
      </section>
      <section className="trending" aria-label="Explore oportunidades">
        <details>
          <summary>
            O que está em alta no Voluntare <ChevronDown size={19} />
          </summary>
          <div className="trending-grid">
            {EM_ALTA.map((grupo) => (
              <div key={grupo.titulo}>
                <h2>{grupo.titulo}</h2>
                {grupo.termos.map((termo) => (
                  <button
                    key={termo}
                    onClick={() => buscar(grupo.local ? { local: termo } : { texto: termo })}
                  >
                    {termo} <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}

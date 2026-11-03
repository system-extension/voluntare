import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { caminhoBusca } from '../../utils/rotas';
import './busca.css';

/** Busca por atividade/organização e por local. Usada no início e na lista de oportunidades. */
export default function BarraBusca({ textoInicial = '', localInicial = '' }) {
  const [texto, setTexto] = useState(textoInicial);
  const [local, setLocal] = useState(localInicial);
  const navegar = useNavigate();

  return (
    <div className="search-wrap">
      <form
        className="search-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          navegar(caminhoBusca({ texto, local }));
        }}
      >
        <label className="search-field">
          <Search size={22} aria-hidden="true" />
          <span className="sr-only">Atividade, palavras-chave ou ONG</span>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Atividade, palavras-chave ou ONG"
          />
        </label>
        <label className="search-field location-field">
          <MapPin size={22} aria-hidden="true" />
          <span className="sr-only">Cidade ou estado</span>
          <input
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Cidade ou estado"
          />
        </label>
        <button className="primary-button search-button" type="submit">
          Achar vagas
        </button>
      </form>
    </div>
  );
}

import { CAUSAS } from '../../api/rotulos';

/** Filtro por causa. Todas as ações são presenciais, então não há filtro de formato. */
export default function FiltroCausa({ causa, aoMudar }) {
  return (
    <div className="filters">
      <label>
        <span>Qual causa você busca?</span>
        <select value={causa} onChange={(e) => aoMudar(e.target.value)}>
          <option value="">Todas as causas</option>
          {CAUSAS.map((item) => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </label>
      {causa && (
        <button className="text-button clear-filters" onClick={() => aoMudar('')}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}

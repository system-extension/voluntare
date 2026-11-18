import { RefreshCw } from 'lucide-react';

export default function ErroCarregamento({ erro, aoTentarNovamente }) {
  return (
    <div className="empty-state" role="alert">
      <h2>Não foi possível carregar</h2>
      <p>{erro?.message ?? 'Tente novamente em alguns instantes.'}</p>
      {aoTentarNovamente && (
        <button className="text-button" onClick={aoTentarNovamente}>
          <RefreshCw size={16} /> Tentar novamente
        </button>
      )}
    </div>
  );
}

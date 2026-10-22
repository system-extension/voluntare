import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginacao({ pagina, totalPaginas, aoMudar }) {
  return (
    <nav className="pagination" aria-label="Páginas de vagas">
      {pagina > 1 && (
        <button
          className="page-button"
          onClick={() => aoMudar(pagina - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
        <button
          key={numero}
          className={`page-button ${pagina === numero ? 'current' : ''}`}
          aria-current={pagina === numero ? 'page' : undefined}
          aria-label={`Página ${numero}`}
          onClick={() => aoMudar(numero)}
        >
          {numero}
        </button>
      ))}
      {pagina < totalPaginas && (
        <button className="primary-button more-jobs" onClick={() => aoMudar(pagina + 1)}>
          Ver mais vagas <ChevronRight size={18} />
        </button>
      )}
    </nav>
  );
}

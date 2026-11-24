/**
 * Marca do Voluntare: o mesmo desenho em todo lugar, só o tamanho muda.
 *   pequeno: cabeçalho e janelas · medio: telas de acesso · grande: página inicial
 * Tamanhos e espaçamento ficam em styles/tema.css (.wordmark); nenhuma tela redefine a marca.
 */
export default function Logo({ tamanho = 'pequeno' }) {
  return (
    <span className={`wordmark wordmark-${tamanho}`}>
      voluntare<span className="wordmark-dot">.</span>
    </span>
  );
}

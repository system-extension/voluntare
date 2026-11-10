import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './seletor.css';

/**
 * Lista de opções com a mesma aparência em qualquer navegador ou sistema
 * (o <select> nativo abre do jeito de cada um). Segue o padrão "combobox + listbox" da WAI-ARIA:
 * o foco fica no botão e a opção ativa é anunciada por aria-activedescendant.
 *
 * Teclado: ↓/↑ ou Enter/Espaço abrem; ↓/↑, Home e End navegam; Enter escolhe; Esc fecha;
 * digitar uma letra pula para a primeira opção que começa com ela.
 *
 * @param {{valor: string, rotulo?: string}[]} opcoes
 * @param {string} valor   valor escolhido ('' = nenhum)
 * @param {(valor: string) => void} aoMudar
 * @param {string} textoVazio  aparece quando nada foi escolhido
 * Os demais props (id, aria-invalid, aria-describedby) vão para o botão: é o que o <label> e o
 * componente Campo esperam.
 */
export default function Seletor({ opcoes, valor, aoMudar, textoVazio = 'Selecione', ...attrs }) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const raiz = useRef(null);
  const lista = useRef(null);
  const idLista = useId();
  const escolhida = opcoes.find((o) => o.valor === valor);
  const idOpcao = (i) => `${idLista}-${i}`;

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;
    const aoClicar = (e) => {
      if (!raiz.current?.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', aoClicar);
    return () => document.removeEventListener('mousedown', aoClicar);
  }, [aberto]);

  // Mantém a opção ativa visível quando a lista rola.
  useEffect(() => {
    if (aberto && ativo >= 0)
      document.getElementById(idOpcao(ativo))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, ativo]);

  const abrir = () => {
    setAtivo(
      Math.max(
        opcoes.findIndex((o) => o.valor === valor),
        0,
      ),
    );
    setAberto(true);
  };
  const escolher = (i) => {
    aoMudar(opcoes[i].valor);
    setAberto(false);
  };

  function aoTeclar(e) {
    const ultimo = opcoes.length - 1;
    if (!aberto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        abrir();
      }
      return;
    }
    const mover = {
      ArrowDown: () => setAtivo((i) => Math.min(i + 1, ultimo)),
      ArrowUp: () => setAtivo((i) => Math.max(i - 1, 0)),
      Home: () => setAtivo(0),
      End: () => setAtivo(ultimo),
      Enter: () => escolher(ativo),
      ' ': () => escolher(ativo),
      Escape: () => setAberto(false),
    }[e.key];
    if (mover) {
      e.preventDefault();
      mover();
    } else if (e.key === 'Tab') {
      setAberto(false);
    } else if (e.key.length === 1) {
      // Busca pela letra, a partir da opção seguinte (digitar "M" várias vezes passa por MA, MG, MS, MT).
      const letra = e.key.toLowerCase();
      const texto = (o) => (o.rotulo ?? o.valor).toLowerCase();
      const depois = [...opcoes.slice(ativo + 1), ...opcoes.slice(0, ativo + 1)];
      const achada = depois.find((o) => texto(o).startsWith(letra));
      if (achada) setAtivo(opcoes.indexOf(achada));
    }
  }

  return (
    <div className="seletor" ref={raiz}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={idLista}
        aria-activedescendant={aberto && ativo >= 0 ? idOpcao(ativo) : undefined}
        className={`seletor-botao ${escolhida ? '' : 'seletor-vazio'}`}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={aoTeclar}
        {...attrs}
      >
        <span>{escolhida ? (escolhida.rotulo ?? escolhida.valor) : textoVazio}</span>
        <ChevronDown size={18} className={aberto ? 'seletor-seta-aberta' : ''} aria-hidden="true" />
      </button>

      {aberto && (
        <ul id={idLista} role="listbox" className="seletor-lista" ref={lista} tabIndex={-1}>
          {opcoes.map((o, i) => (
            <li
              key={o.valor}
              id={idOpcao(i)}
              role="option"
              aria-selected={o.valor === valor}
              className={i === ativo ? 'seletor-ativa' : ''}
              // mousedown + preventDefault: escolhe sem tirar o foco do botão.
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(i);
              }}
              onMouseEnter={() => setAtivo(i)}
            >
              {o.rotulo ?? o.valor}
              {o.valor === valor && <Check size={16} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

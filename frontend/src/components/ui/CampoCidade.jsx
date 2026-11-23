import { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cidadeOficial } from '../../dados/municipios';
import { normalizar } from '../../utils/texto';
import './seletor.css';

const LIMITE = 60;

/**
 * Cidade com busca, limitada às cidades da UF escolhida (padrão "combobox" com lista da WAI-ARIA).
 * A pessoa digita e escolhe na lista; ao sair do campo, um nome digitado igual ao oficial
 * (sem acento ou com outra caixa) vira a grafia oficial.
 *
 * @param {object|null} municipios  { UF: [nomes] } de useMunicipios()
 * Os demais props (id, aria-invalid, aria-describedby) vão para o <input>.
 */
export default function CampoCidade({ municipios, uf, valor, aoMudar, ...attrs }) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const idLista = useId();
  const lista = useRef(null);

  const opcoes = useMemo(() => {
    const todas = municipios?.[uf] ?? [];
    const busca = normalizar(valor);
    if (!busca) return todas.slice(0, LIMITE);
    // quem começa com o texto vem antes de quem só contém
    const comeca = [];
    const contem = [];
    for (const c of todas) {
      const n = normalizar(c);
      if (n.startsWith(busca)) comeca.push(c);
      else if (n.includes(busca)) contem.push(c);
    }
    return [...comeca, ...contem].slice(0, LIMITE);
  }, [municipios, uf, valor]);

  const semUf = !uf;
  const idOpcao = (i) => `${idLista}-${i}`;

  const escolher = (nome) => {
    aoMudar(nome);
    setAberto(false);
  };

  function aoTeclar(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!aberto) setAberto(true);
      else setAtivo((i) => Math.min(i + 1, opcoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && aberto && opcoes[ativo]) {
      e.preventDefault();
      escolher(opcoes[ativo]);
    } else if (e.key === 'Escape') {
      setAberto(false);
    }
  }

  return (
    <div className="seletor">
      <div className="campo-cidade">
        <input
          {...attrs}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={aberto && opcoes.length > 0}
          aria-controls={idLista}
          aria-activedescendant={aberto && opcoes[ativo] ? idOpcao(ativo) : undefined}
          disabled={semUf}
          placeholder={semUf ? 'Escolha o estado primeiro' : 'Digite para buscar'}
          value={valor}
          onChange={(e) => {
            aoMudar(e.target.value);
            setAtivo(0);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => {
            setAberto(false);
            const oficial = cidadeOficial(municipios, uf, valor);
            if (oficial && oficial !== valor) aoMudar(oficial);
          }}
          onKeyDown={aoTeclar}
        />
        <ChevronDown size={18} aria-hidden="true" />
      </div>
      {aberto && !semUf && (
        <ul id={idLista} role="listbox" className="seletor-lista" ref={lista}>
          {!municipios && <li className="seletor-vazia">Carregando cidades…</li>}
          {municipios && !opcoes.length && (
            <li className="seletor-vazia">Nenhuma cidade com esse nome em {uf}</li>
          )}
          {opcoes.map((c, i) => (
            <li
              key={c}
              id={idOpcao(i)}
              role="option"
              aria-selected={c === valor}
              className={i === ativo ? 'seletor-ativa' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                escolher(c);
              }}
              onMouseEnter={() => setAtivo(i)}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

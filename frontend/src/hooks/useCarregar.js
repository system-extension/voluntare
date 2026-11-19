import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carrega dados de uma função assíncrona e controla os 3 estados de toda tela:
 * carregando → dados | erro.
 *
 * `deps`: quando muda (ex.: filtros), carrega de novo.
 * `recarregar()`: força nova busca (ex.: depois de encerrar uma vaga).
 */
export default function useCarregar(funcao, deps = []) {
  const ultimaFuncao = useRef(funcao);
  useEffect(() => {
    ultimaFuncao.current = funcao;
  });

  const [versao, setVersao] = useState(0);
  const chave = JSON.stringify(deps) + '|' + versao;
  const [estado, setEstado] = useState({ chave: null, dados: null, erro: null });

  useEffect(() => {
    let ativo = true;
    ultimaFuncao
      .current()
      .then((dados) => ativo && setEstado({ chave, dados, erro: null }))
      .catch((erro) => ativo && setEstado((e) => ({ chave, dados: e.dados, erro })));
    return () => {
      ativo = false;
    };
  }, [chave]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return {
    carregando: estado.chave !== chave,
    dados: estado.dados,
    erro: estado.chave === chave ? estado.erro : null,
    recarregar,
  };
}

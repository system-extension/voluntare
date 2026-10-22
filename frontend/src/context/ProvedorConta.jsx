import { useMemo, useState } from 'react';
import { ContextoConta } from './contextos';

const PERFIL_INICIAL = {
  name: 'Pessoa Voluntária',
  city: 'Sua cidade, Brasil',
  email: 'voluntario@example.com',
  about: '',
};

const PREFERENCIAS_INICIAIS = {
  visible: true,
  ready: false,
  values: {
    Causas: 'Educação',
    'Horário disponível': 'Fins de semana',
    'Formato da vaga': 'Remoto',
    'Tempo de dedicação': '2 horas por semana',
    Deslocamento: 'Até 10 km',
  },
};

/**
 * Conta de demonstração. O perfil será refeito quando o login (E2) existir;
 * por enquanto guarda tudo em memória, como antes.
 */
export default function ProvedorConta({ children }) {
  const [demonstracao, setDemonstracao] = useState(false);
  const [perfil, setPerfil] = useState(PERFIL_INICIAL);
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_INICIAIS);

  const valor = useMemo(
    () => ({
      demonstracao,
      entrar: () => setDemonstracao(true),
      sair: () => setDemonstracao(false),
      perfil,
      setPerfil,
      preferencias,
      setPreferencias,
    }),
    [demonstracao, perfil, preferencias],
  );

  return <ContextoConta.Provider value={valor}>{children}</ContextoConta.Provider>;
}

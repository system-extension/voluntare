import { createContext } from 'react';

/** Objetos de contexto ficam separados dos provedores (componentes) e dos hooks. */
export const ContextoModal = createContext(null);
export const ContextoConta = createContext(null);
export const ContextoVagasSalvas = createContext(null);

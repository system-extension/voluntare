/**
 * Chave única que decide de onde vêm os dados:
 *   - false (padrão): modo demonstração. Os dados ficam no navegador (src/api/mock).
 *   - true: chama o backend Spring de verdade (/api/...).
 *
 * Para ligar: criar frontend/.env.local com a linha  VITE_USAR_API=true
 * Nenhuma tela muda: elas só conhecem as funções desta pasta.
 */
export const USAR_API_REAL = import.meta.env.VITE_USAR_API === 'true';

/** Simula a demora da rede no modo demonstração, para as telas já tratarem "carregando". */
export const ATRASO_MOCK_MS = 200;

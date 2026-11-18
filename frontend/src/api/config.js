/**
 * Endereço da API, lido do ambiente (frontend/.env.local; modelo em .env.example).
 *
 * Vazio (padrão): as chamadas vão para "/api/..." no mesmo endereço do site.
 *   - `npm run dev`: o proxy do Vite repassa para o backend (API_ALVO).
 *   - produção: o servidor que entrega o site repassa /api para o backend.
 * Preenchido (ex.: https://api.voluntare.app): o navegador chama a API direto,
 *   e o backend precisa liberar a origem do site em CORS_ORIGENS.
 *
 * As telas e os arquivos de src/api não sabem qual é o caso: só o cliente.js usa isto.
 */
export const URL_API = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

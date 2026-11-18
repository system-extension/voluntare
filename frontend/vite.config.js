import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Variáveis em .env / .env.local (ver .env.example):
 *   VITE_BASE   pasta do site no servidor (no GitHub Pages: /voluntare/)
 *   API_ALVO    para onde o proxy do `npm run dev` repassa /api (padrão: o Spring local)
 * API_ALVO não tem o prefixo VITE_, então nunca vai para o código do navegador:
 * só o servidor de desenvolvimento conhece o endereço do backend.
 */
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

  return {
    base: env.VITE_BASE || '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.API_ALVO || 'http://localhost:8080',
          changeOrigin: true,
          // O navegador acha que fala com o próprio Vite (mesma origem), então para ele não há CORS.
          // Tirar o Origin faz o Spring tratar a chamada como de mesma origem também; sem isso,
          // ele compara a origem (127.0.0.1:5173) com CORS_ORIGENS e recusa com 403.
          configure: (proxy) => proxy.on('proxyReq', (req) => req.removeHeader('origin')),
        },
      },
    },
  };
});

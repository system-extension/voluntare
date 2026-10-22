import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No GitHub Pages o site fica em /voluntare/; localmente continua na raiz.
// Em desenvolvimento, /api vai para o Spring (porta 8080): o navegador enxerga um endereço só, sem CORS.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});

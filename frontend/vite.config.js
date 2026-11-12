import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No GitHub Pages o site fica em /voluntare/; localmente continua na raiz.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});

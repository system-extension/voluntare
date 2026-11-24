import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta do fluxo de demonstração (docs/testes.md).
 * Precisam do sistema no ar: docker compose -f compose.avaliacao.yaml up -d --build --wait (na raiz).
 * E2E_URL troca o endereço, se o front estiver em outro lugar.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_URL || 'http://localhost:5173',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

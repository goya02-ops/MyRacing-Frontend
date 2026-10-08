import { defineConfig } from '@playwright/test';

// FE-1: smoke E2E mínimo. Solo chromium (liviano).
// Base URL configurable para CI/preview: PLAYWRIGHT_BASE_URL.
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
  },
  // Levanta el dev server de Vite si no hay uno corriendo.
  // Siempre reusa el existente: el CI ya levanta Vite en un step previo.
  webServer: {
    command: 'pnpm dev --port 5173',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

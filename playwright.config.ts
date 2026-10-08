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
  // En dev reusa el servidor existente; en CI levanta uno propio.
  webServer: {
    command: 'pnpm dev --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

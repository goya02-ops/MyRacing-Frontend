import { test, expect } from '@playwright/test';

// FE-1: smoke E2E mínimo (issue #2). Requiere playwright.config con
// baseURL + webServer.
test('smoke: la home renderiza carreras disponibles', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /carreras disponibles/i }),
  ).toBeVisible();
});

test('smoke: /login renderiza el formulario de auth', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
});

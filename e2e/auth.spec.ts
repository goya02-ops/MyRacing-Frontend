import { test, expect, type Page } from '@playwright/test';

// FE-10: E2E login + ProtectedRoute (issue #11).
// La API se mockea con page.route para correr sin backend local. En CI
// (job "E2E full stack") los mocks interceptan antes de llegar al backend real.

type MockUser = {
  id: number;
  userName: string;
  realName: string;
  email: string;
  type: 'admin' | 'common' | 'premium';
};

function loginForm(page: Page) {
  return page.locator('form', { has: page.locator('#emailOrUsername') });
}

async function mockLogin(
  page: Page,
  status: number,
  body: Record<string, unknown>,
) {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }),
  );
}

async function mockCombinations(page: Page) {
  await page.route('**/combinations/races**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
}

async function seedAuth(page: Page, user: MockUser) {
  await page.addInitScript((u) => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
}

const commonUser: MockUser = {
  id: 1,
  userName: 'luciano',
  realName: 'Luciano Marini',
  email: 'luciano@test.com',
  type: 'common',
};

test('login válido redirige a la home y activa la sesión', async ({ page }) => {
  await mockCombinations(page);
  await mockLogin(page, 200, {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: commonUser,
  });

  await page.goto('/login');
  await loginForm(page).locator('#emailOrUsername').fill('luciano@test.com');
  await loginForm(page).locator('#password').fill('secret123');
  await loginForm(page)
    .getByRole('button', { name: /iniciar sesión/i })
    .click();

  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('button', { name: /cerrar sesión/i }),
  ).toBeVisible();
});

test('login inválido muestra el mensaje de error', async ({ page }) => {
  await mockLogin(page, 401, { message: 'Credenciales inválidas' });

  await page.goto('/login');
  await loginForm(page).locator('#emailOrUsername').fill('luciano@test.com');
  await loginForm(page).locator('#password').fill('incorrecta');
  await loginForm(page)
    .getByRole('button', { name: /iniciar sesión/i })
    .click();

  await expect(
    loginForm(page).getByText('Credenciales inválidas'),
  ).toBeVisible();
});

test('login con campos vacíos pide completarlos', async ({ page }) => {
  await page.goto('/login');
  await loginForm(page)
    .getByRole('button', { name: /iniciar sesión/i })
    .click();

  await expect(
    loginForm(page).getByText('Todos los campos son obligatorios'),
  ).toBeVisible();
});

test('ProtectedRoute sin sesión redirige a /login', async ({ page }) => {
  await page.goto('/my-profile');
  await expect(page).toHaveURL('/login');
});

test('ProtectedRoute con rol insuficiente redirige a la home', async ({
  page,
}) => {
  await mockCombinations(page);
  await seedAuth(page, commonUser);

  await page.goto('/admin-dashboard');

  await expect(page).toHaveURL('/');
});

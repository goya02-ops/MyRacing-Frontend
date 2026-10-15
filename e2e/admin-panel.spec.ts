import { test, expect, type Page } from '@playwright/test';

// FE-13: E2E panel admin básico (issue #14).
// Cubre: login admin por el formulario + CRUD mínimo (crear/leer/editar) de
// Categorías y Simuladores. La UI NO expone borrado, así que no hay DELETE.
// La API se mockea con page.route para correr sin backend local. En CI (job
// "E2E full stack") los mocks interceptan antes de llegar al backend real.

type MockUser = {
  id: number;
  userName: string;
  realName: string;
  email: string;
  type: 'admin' | 'common' | 'premium';
};

type MockEntity = { id?: number } & Record<string, unknown>;

const adminUser: MockUser = {
  id: 1,
  userName: 'admin',
  realName: 'Admin Test',
  email: 'admin@test.com',
  type: 'admin',
};

async function seedAuth(page: Page, user: MockUser) {
  await page.addInitScript((u) => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
}

// Mock CRUD stateful: refleja POST/PUT en la lista que devuelve el GET, para
// que el refetch posterior a la mutación (invalidación de query) muestre el
// cambio. Usa una queryKey `[cls.name]` (ver useEntityMutation).
async function mockCrud(
  page: Page,
  resource: string,
  initial: MockEntity[] = [],
): Promise<{ gets: number; list: MockEntity[] }> {
  const state = { list: initial.map((e) => ({ ...e })), nextId: 1000, gets: 0 };

  await page.route(new RegExp(`/${resource}(?:/\\d+)?$`), async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'GET') {
      state.gets += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: state.list }),
      });
      return;
    }

    if (method === 'POST') {
      const body = request.postDataJSON() as MockEntity;
      const created: MockEntity = { ...body, id: state.nextId++ };
      state.list.push(created);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: created }),
      });
      return;
    }

    if (method === 'PUT') {
      const id = Number(/(\d+)$/.exec(request.url())?.[1]);
      const body = request.postDataJSON() as MockEntity;
      state.list = state.list.map((e) =>
        e.id === id ? { ...body, id } : e,
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ...body, id } }),
      });
      return;
    }

    await route.fallback();
  });

  return state;
}

test('el admin inicia sesión y accede a /admin-dashboard', async ({ page }) => {
  // Catch-all para los GET de la home/panel (evita pegarle al backend real).
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    }),
  );
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: adminUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    }),
  );

  await page.goto('/login');
  const loginForm = page
    .locator('form')
    .filter({ has: page.locator('#emailOrUsername') });
  await loginForm.locator('#emailOrUsername').fill('admin@test.com');
  await loginForm.locator('#password').fill('secret123');
  await loginForm.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL('/');
  await page
    .getByRole('button', { name: 'Panel de Administración' })
    .click();

  await expect(page).toHaveURL('/admin-dashboard');
  await expect(
    page.getByRole('heading', { name: 'Panel de Administración' }),
  ).toBeVisible();
});

test.describe('FE-13: CRUD mínimo', () => {
  test('crea y edita una categoría', async ({ page }) => {
    await seedAuth(page, adminUser);
    const categories = await mockCrud(page, 'categories');

    await page.goto('/admin-dashboard?section=categories');
    await expect(
      page.getByRole('heading', { name: 'Categorías' }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Nueva Categoría/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Crear Nueva Categoría' }),
    ).toBeVisible();

    await page.getByLabel('Denominación').fill('Turismo Carretera');
    await page.getByLabel('Abreviación').fill('TC');
    await page.getByLabel('Descripción').fill('Cat de prueba');

    const postRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && /\/categories$/.test(req.url()),
    );
    await page.getByRole('button', { name: 'Guardar' }).click();

    const created = await postRequest;
    expect(created.postDataJSON()).toEqual({
      denomination: 'Turismo Carretera',
      abbreviation: 'TC',
      description: 'Cat de prueba',
    });
    await expect(
      page.getByRole('cell', { name: 'Turismo Carretera' }),
    ).toBeVisible();
    await expect.poll(() => categories.gets).toBeGreaterThanOrEqual(2);

    // Editar la fila creada (única fila).
    await page.getByRole('button', { name: 'Editar' }).first().click();
    await expect(
      page.getByRole('heading', { name: 'Editar Categoría' }),
    ).toBeVisible();
    await page.getByLabel('Denominación').fill('Categoría Editada');

    const putRequest = page.waitForRequest(
      (req) => req.method() === 'PUT' && /\/categories\/\d+$/.test(req.url()),
    );
    await page.getByRole('button', { name: 'Guardar' }).click();

    const update = await putRequest;
    expect(update.postDataJSON()).toMatchObject({
      denomination: 'Categoría Editada',
    });
    expect(update.url()).toContain(`/categories/${categories.list[0].id}`);
    await expect(
      page.getByRole('cell', { name: 'Categoría Editada' }),
    ).toBeVisible();
  });

  test('crea y edita un simulador', async ({ page }) => {
    await seedAuth(page, adminUser);
    const simulators = await mockCrud(page, 'simulators');

    await page.goto('/admin-dashboard?section=simulators');
    await expect(
      page.getByRole('heading', { name: 'Simuladores' }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Nuevo Simulador/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Crear Nuevo' }),
    ).toBeVisible();

    await page.getByLabel('Nombre').fill('iRacing');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Activo', exact: true }).click();

    const postRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().includes('/simulators'),
    );
    await page.getByRole('button', { name: 'Guardar' }).click();

    const createRequest = await postRequest;
    expect(createRequest.postDataJSON()).toEqual({
      name: 'iRacing',
      status: 'Activo',
    });
    await expect(page.getByRole('cell', { name: 'iRacing' })).toBeVisible();
    await expect.poll(() => simulators.gets).toBeGreaterThanOrEqual(2);

    await page.getByRole('button', { name: 'Editar' }).first().click();
    await expect(
      page.getByRole('heading', { name: /Editar Simulador/ }),
    ).toBeVisible();

    await page.getByLabel('Nombre').fill('iRacing Evo');

    const putRequest = page.waitForRequest(
      (req) => req.method() === 'PUT' && req.url().includes('/simulators/'),
    );
    await page.getByRole('button', { name: 'Guardar' }).click();

    const updateRequest = await putRequest;
    expect(updateRequest.postDataJSON()).toMatchObject({
      name: 'iRacing Evo',
    });
    await expect(
      page.getByRole('cell', { name: 'iRacing Evo' }),
    ).toBeVisible();
  });

  test('muestra toast cuando falla el guardado de una categoría', async ({
    page,
  }) => {
    await seedAuth(page, adminUser);
    await page.route(/\/categories$/, (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'boom' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/admin-dashboard?section=categories');
    await page.getByRole('button', { name: /Nueva Categoría/ }).click();
    await page.getByLabel('Denominación').fill('Duplicada');
    await page.getByLabel('Abreviación').fill('DUP');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(
      page.getByText('No se pudo guardar la categoría.', { exact: true }),
    ).toBeVisible();
  });
});

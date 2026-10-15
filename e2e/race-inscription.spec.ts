import { test, expect, type Page } from '@playwright/test';

// FE-11: E2E inscripción a carrera (issue #12).
// Flujo: home -> seleccionar combinación -> inscribirse en la próxima carrera.
// La API se mockea con page.route para correr sin backend local. En CI
// (job "E2E full stack") los mocks interceptan antes de llegar al backend real.

type MockUser = {
  id: number;
  userName: string;
  realName: string;
  email: string;
  type: 'admin' | 'common' | 'premium';
};

const commonUser: MockUser = {
  id: 1,
  userName: 'luciano',
  realName: 'Luciano Marini',
  email: 'luciano@test.com',
  type: 'common',
};

const COMBINATION_ID = 7;

const combination = {
  id: COMBINATION_ID,
  userType: 'Común',
  dateTo: '2999-12-31T00:00:00.000Z',
  lapsNumber: 10,
  obligatoryStopsQuantity: 2,
  categoryVersion: {
    category: { denomination: 'Categoria Test' },
    simulator: { id: 1, name: 'Simulador Test' },
  },
  circuitVersion: {
    circuit: { denomination: 'Circuito Test' },
    simulator: { id: 1, name: 'Simulador Test' },
  },
};

const race = {
  id: 42,
  raceDateTime: '2999-01-01T12:00:00.000Z',
  registrationDeadline: '2999-01-01T10:00:00.000Z',
  raceUsers: [],
  // Requerido por useRaceInscription.onSuccess para invalidar la query.
  combination: { id: COMBINATION_ID },
};

async function seedAuth(page: Page, user: typeof commonUser) {
  await page.addInitScript((u) => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
}

async function mockCombinations(page: Page) {
  await page.route('**/combinations/races**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [combination] }),
    }),
  );
}

async function mockRacesForCombination(page: Page) {
  const state = { calls: 0 };
  await page.route('**/races/by-combination/**', (route) => {
    state.calls += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { previousRaces: [], nextRaces: [race] },
      }),
    });
  });
  return state;
}

async function mockRegister(page: Page, status: number) {
  await page.route('**/race-users**', (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 9, userId: 1, raceId: race.id } }),
    });
  });
}

// La tarjeta de combinación de la home abre el detalle de inscripción.
async function openCombinationDetail(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Categoria Test/ }).click();
}

test.describe('FE-11: inscripción a carrera', () => {
  test('inscribe y revalida las carreras de la combinación', async ({
    page,
  }) => {
    await seedAuth(page, commonUser);
    await mockCombinations(page);
    const races = await mockRacesForCombination(page);
    await mockRegister(page, 200);

    await openCombinationDetail(page);

    // El primer botón "Inscribirse" es el de CombinationCard (aparece antes en
    // el DOM que el de RaceListItem, que hoy tiene un onClick roto: ver
    // src/features/AvailableRaces/components/RaceListItem.tsx:62).
    const inscribirse = page.getByRole('button', { name: 'Inscribirse' }).first();
    await expect(inscribirse).toBeVisible();

    const postRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().includes('/race-users'),
    );
    await inscribirse.click();

    const request = await postRequest;
    expect(request.postDataJSON()).toEqual({ userId: 1, raceId: race.id });

    await expect(
      page.getByRole('button', { name: 'Inscripto ✅' }).first(),
    ).toBeVisible();

    // onSuccess invalida la query de carreras -> se vuelve a pedir la lista.
    await expect.poll(() => races.calls).toBeGreaterThanOrEqual(2);
  });

  test('muestra toast cuando el backend rechaza la inscripción', async ({
    page,
  }) => {
    await seedAuth(page, commonUser);
    await mockCombinations(page);
    await mockRacesForCombination(page);
    await mockRegister(page, 500);

    await openCombinationDetail(page);

    await page.getByRole('button', { name: 'Inscribirse' }).first().click();

    await expect(
      page.getByText('No se pudo inscribir, intente nuevamente.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Inscribirse' }).first(),
    ).toBeVisible();
  });
});

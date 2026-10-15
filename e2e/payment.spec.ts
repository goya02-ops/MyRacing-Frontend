import {
  test,
  expect,
  request as baseRequest,
  type APIRequestContext,
} from '@playwright/test';
import {
  ADMIN_EMAIL,
  APROBADO_EMAIL,
  RECHAZADO_EMAIL,
  TEST_PASSWORD,
  ensureMembership,
  ensureSeedUser,
  getMyType,
  getSeedCommonUser,
  loginAs,
} from './payment/seed';
import {
  createCardToken,
  extractPaymentId,
  openWalletAndCheckMethods,
  processPaymentApi,
} from './payment/helpers';

// E2E de pago REAL contra el sandbox de Mercado Pago (nada mockeado).
// Caso (a): tarjeta aprobada → status page con payment_id + premium.
// Caso (b): tarjeta rechazada → sigue común. Detalle de los pasos en
// ./payment/seed.ts (contexto previo) y ./payment/helpers.ts (el pago).
// Requiere DB efímera: el caso aprobado deja a su usuario en premium.

let api: APIRequestContext;
let adminToken = '';

test.beforeAll(async () => {
  api = await baseRequest.newContext();
  const admin = await ensureSeedUser(api, {
    userName: 'fe12_admin',
    realName: 'FE12 Admin',
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
    type: 'admin',
  });
  adminToken = admin.accessToken;
  await ensureMembership(api, adminToken);
});

test.afterAll(async () => {
  await api?.dispose();
});

test(
  'pago aprobado con tarjeta test → /payment-status?payment_id= + estado aprobado y usuario premium',
  async ({ page }) => {
    test.setTimeout(180000);
    const session = await getSeedCommonUser(api, APROBADO_EMAIL, 'aprobado');
    await loginAs(page, session);
    await openWalletAndCheckMethods(page);

    const cardToken = await createCardToken(api, 'APRO');
    const { status, body } = await processPaymentApi(
      api,
      session.accessToken,
      cardToken,
    );
    expect(
      status,
      `process-payment aprobado: se esperaba 200, body: ${JSON.stringify(body)}`,
    ).toBe(200);
    const paymentId = extractPaymentId(body);

    // Navegación UI real: la página lee `payment_id` del query
    // (usePaymentStatus.ts) y monta el Status Brick en
    // `#status_brick_container` (paymentStatus.tsx), que solo renderiza con
    // `paymentId`.
    await page.goto(`/payment-status?payment_id=${paymentId}`);
    await expect(page.locator('#status_brick_container')).toBeVisible({
      timeout: 90000,
    });
    await expect(
      page.locator('#status_brick_container').getByText(/aprob|acredit/i).first(),
    ).toBeVisible({ timeout: 90000 });
    await expect(await getMyType(api, session.accessToken)).toBe('premium');
  },
);

test(
  'pago rechazado (titular OTHE) → 400 rejected, sigue común, /membership-payment muestra botón de pago',
  async ({ page }) => {
    test.setTimeout(180000);
    const session = await getSeedCommonUser(api, RECHAZADO_EMAIL, 'rechazado');
    await loginAs(page, session);
    // La wallet monta también para otro usuario: la UI no depende del usuario.
    await openWalletAndCheckMethods(page);

    const cardToken = await createCardToken(api, 'OTHE');
    const { status, body } = await processPaymentApi(
      api,
      session.accessToken,
      cardToken,
    );
    expect(
      status,
      `process-payment rechazado: se esperaba 400, body: ${JSON.stringify(body)}`,
    ).toBe(400);
    expect(JSON.stringify(body)).toMatch(/reject/i);
    await expect(await getMyType(api, session.accessToken)).toBe('common');

    // Assert UI: sigue común → /membership-payment ofrece el botón de pago
    // (no es premium). NO se navega a payment-status en este caso.
    await page.goto('/membership-payment');
    await expect(
      page.getByRole('button', { name: /pagar y convertirme en premium/i }),
    ).toBeVisible({ timeout: 60000 });
  },
);

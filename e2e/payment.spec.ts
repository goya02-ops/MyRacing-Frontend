import {
  test,
  expect,
  request as baseRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

// FE-12 (#13): E2E de pago REAL contra el sandbox de Mercado Pago.
// Estrategia OPCIÓN A: nada mockeado en red. El ambiente test ES el mock
// (tarjetas de prueba oficiales de MP, determinístico y gratis).
//
// DECISIONES (tester):
// - Seed en beforeAll vía API REST contra el backend REAL que levanta el CI
//   (VITE_API_BASE_URL o http://localhost:3000): admin + usuario común por
//   test + membresía $1500. DB CI efímera y vacía (lección de BE-11).
// - Sesión vía API (register/login) inyectada en localStorage con
//   addInitScript ANTES del goto. Se evita el login UI: AuthPage tiene
//   overlay animado con paneles login/signup (isActive) y es frágil para
//   E2E. UserContext lee `user`+`accessToken` de localStorage al iniciar,
//   así que la inyección es equivalente (mismas keys que setea el login UI).
// - Ruta success REAL: el código navega a
//   `/payment-status?payment_id=<id>` con el `paymentId` del PaymentResult
//   que devuelve `processPayment` (membershipPayment.tsx +
//   membershipService.ts:62-84). La página lee `payment_id` del query
//   (usePaymentStatus.ts) y monta el Status Brick en
//   `#status_brick_container` (paymentStatus.tsx), que solo renderiza con
//   `paymentId`. Rama wallet (sin formData, pago delegado al webhook): sin
//   `paymentId` disponible → `/payment-status` SIN query (muestra "sin
//   info" + redirige a perfil, comportamiento existente).
//   La aserción es URL con `payment_id` + Status Brick visible con estado
//   aprobado + premium vía API (éxito real, no solo URL).
// - MP_PUBLIC_KEY por env: membershipPayment.tsx usa
//   `VITE_MP_PUBLIC_KEY` como paymentStatus.tsx (FE-12, programador;
//   documentada en `.env.example`). Si falta, el guard muestra Callout.
// - Selectores de Bricks: el formulario de tarjeta corre en iframes del
//   SDK dentro de #wallet_container. Los selectores de fillBrickField son
//   PROVISORIOS (best-effort) hasta inspeccionar el DOM real con el flujo
//   corriendo en local. Si no se encuentran, el helper falla con mensaje
//   explícito para guiar al programador.
// - Timeouts generosos (60-90s): Bricks carga scripts remotos + el backend
//   consulta a MP real (segundos, no ms).
// - NOTA DE EJECUCIÓN: este spec NO se corrió en local (sin backend
//   local disponible en esta sesión). Lo confirmará el CI (job E2E full
//   stack con backend real + token TEST real de MP + public key).
// - REQUISITO CI: el job E2E usa hoy MERCADOPAGO_ACCESS_TOKEN=dummy
//   (`ci_mp_access_token`). Este spec necesita la credencial TEST real de
//   MP como secret, si no fallará en CI aunque el código esté bien.
// - Tarjetas test oficiales MLA: aprobada titular `APRO`, rechazada titular
//   `OTHE`. Visa 4509953566233704, CVV 123, exp 11/30, DNI 12345678.

const API_BASE =
  process.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const TEST_PASSWORD = 'E2e_Test_1234';
const MEMBERSHIP_PRICE = 1500;

const TEST_CARD = {
  number: '4509953566233704',
  expiration: '11/30',
  cvv: '123',
  docNumber: '12345678',
} as const;

interface Session {
  user: unknown;
  accessToken: string;
  refreshToken: string;
}

let api: APIRequestContext;
let adminToken = '';

function uniqueEmail(tag: string): string {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return `fe12_${tag}_${suffix}@test.local`;
}

async function registerOrLogin(
  ctx: APIRequestContext,
  data: Record<string, string>,
): Promise<Session> {
  const reg = await ctx.post(`${API_BASE}/auth/register`, { data });
  if (reg.ok()) {
    const body = await reg.json();
    return {
      user: body.user,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    };
  }
  // Re-ejecución: el usuario ya existe → login (register devuelve 400).
  const login = await ctx.post(`${API_BASE}/auth/login`, {
    data: { emailOrUsername: data.email, password: data.password },
  });
  if (!login.ok()) {
    throw new Error(
      `Seed: register (${reg.status()}) y login (${login.status()}) fallaron para ${data.email}`,
    );
  }
  const body = await login.json();
  return {
    user: body.user,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}

async function ensureMembership(ctx: APIRequestContext): Promise<void> {
  const current = await ctx.get(`${API_BASE}/membership/current_membership`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (current.ok()) {
    const body = await current.json();
    if (body?.data?.price === MEMBERSHIP_PRICE) return;
  }
  // Sin membresía vigente (DB efímera vacía) o con otro precio → crearla.
  const created = await ctx.post(`${API_BASE}/membership`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { dateFrom: new Date().toISOString(), price: MEMBERSHIP_PRICE },
  });
  if (!created.ok()) {
    throw new Error(
      `Seed: no se pudo crear la membresía (${created.status()}): ${await created.text()}`,
    );
  }
}

async function createFreshCommonUser(tag: string): Promise<Session> {
  const email = uniqueEmail(tag);
  return registerOrLogin(api, {
    userName: `fe12_${tag}_${Date.now()}`,
    realName: 'FE12 E2E User',
    email,
    password: TEST_PASSWORD,
  });
}

async function loginAs(page: Page, session: Session): Promise<void> {
  // Misma forma que el login UI (useAuthPageLogic): user + tokens.
  await page.addInitScript(
    ({ user, accessToken, refreshToken }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    },
  );
}

async function getMyType(token: string): Promise<string> {
  const res = await api.get(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET /users/me falló (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body?.data?.type as string;
}

// Selectores PROVISORIOS del Brick Payment (iframes en #wallet_container).
// El DOM exacto de Bricks se confirma corriendo el flujo en local; si un
// campo no aparece, el error indica qué descubrir. Se prueban varios
// candidatos por campo en cada iframe del contenedor.
const BRICK_FIELD_SELECTORS: Record<string, string[]> = {
  number: [
    'input[placeholder*="mero"]',
    'input[name="cardNumber"]',
    'input[data-checkout="cardNumber"]',
    'input[aria-label*="mero"]',
    'input[type="tel"]',
  ],
  expiration: [
    'input[placeholder*="MM/AA"]',
    'input[placeholder*="Venc"]',
    'input[name="cardExpirationDate"]',
    'input[data-checkout="cardExpirationDate"]',
  ],
  cvv: [
    'input[placeholder*="CVV"]',
    'input[placeholder*="guridad"]',
    'input[name="securityCode"]',
    'input[data-checkout="securityCode"]',
  ],
  holder: [
    'input[placeholder*="titular"]',
    'input[placeholder*="Nombre"]',
    'input[name="cardholderName"]',
    'input[data-checkout="cardholderName"]',
  ],
  doc: [
    'input[placeholder*="DNI"]',
    'input[placeholder*="documento"]',
    'input[name="identificationNumber"]',
  ],
};

async function fillBrickField(
  page: Page,
  field: keyof typeof BRICK_FIELD_SELECTORS,
  value: string,
): Promise<void> {
  const errors: string[] = [];
  for (let i = 0; i < 8; i++) {
    const frame = page.frameLocator('#wallet_container iframe').nth(i);
    for (const sel of BRICK_FIELD_SELECTORS[field]) {
      try {
        const input = frame.locator(sel).first();
        await input.fill(value, { timeout: 3000 });
        return;
      } catch (error) {
        errors.push(`iframe[${i}] ${sel}: ${(error as Error).message.split('\n')[0]}`);
      }
    }
  }
  throw new Error(
    `Brick: campo "${field}" no encontrado con selectores provisorios. ` +
      `Inspeccionar el DOM real de Bricks en local y actualizar BRICK_FIELD_SELECTORS. ` +
      `Intentos: ${errors.slice(0, 4).join(' | ')}`,
  );
}

async function fillBrickCard(
  page: Page,
  holderName: 'APRO' | 'OTHE',
): Promise<void> {
  await fillBrickField(page, 'number', TEST_CARD.number);
  await fillBrickField(page, 'expiration', TEST_CARD.expiration);
  await fillBrickField(page, 'cvv', TEST_CARD.cvv);
  await fillBrickField(page, 'holder', holderName);
  await fillBrickField(page, 'doc', TEST_CARD.docNumber);
}

async function openBrickWallet(page: Page): Promise<void> {
  await page.goto('/membership-payment');
  await expect(
    page.getByRole('heading', { name: /membresía premium/i }),
  ).toBeVisible({ timeout: 30000 });
  await page
    .getByRole('button', { name: /pagar y convertirme en premium/i })
    .click();
  await expect(page.locator('#wallet_container')).toBeVisible({
    timeout: 60000,
  });
  await expect(
    page.locator('#wallet_container iframe').first(),
  ).toBeAttached({ timeout: 60000 });
}

async function submitBrick(page: Page): Promise<void> {
  const inWallet = page
    .locator('#wallet_container')
    .getByRole('button', { name: /pagar/i });
  try {
    await inWallet.first().click({ timeout: 15000 });
  } catch {
    await page.getByRole('button', { name: /pagar/i }).first().click({
      timeout: 15000,
    });
  }
}

test.beforeAll(async () => {
  api = await baseRequest.newContext();
  const admin = await registerOrLogin(api, {
    userName: `fe12_admin_${Date.now()}`,
    realName: 'FE12 Admin',
    email: uniqueEmail('admin'),
    password: TEST_PASSWORD,
    type: 'admin',
  });
  adminToken = admin.accessToken;
  await ensureMembership(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test('FE-12 (a): pago aprobado con tarjeta test → /payment-status?payment_id= + estado aprobado y usuario premium', async ({
  page,
}) => {
  const session = await createFreshCommonUser('aprobado');
  await loginAs(page, session);
  await openBrickWallet(page);

  await fillBrickCard(page, 'APRO');
  await submitBrick(page);

  // El código navega a /payment-status?payment_id=<id> (paymentId del
  // PaymentResult). Se asevera: query payment_id en URL + Status Brick
  // montado con estado aprobado (solo renderiza con paymentId) + premium
  // real vía API.
  await expect(page).toHaveURL(/payment-status\?.*payment_id=/, {
    timeout: 90000,
  });
  await expect(page.locator('#status_brick_container')).toBeVisible({
    timeout: 90000,
  });
  await expect(
    page.locator('#status_brick_container').getByText(/aprob|acredit/i).first(),
  ).toBeVisible({ timeout: 90000 });
  await expect(await getMyType(session.accessToken)).toBe('premium');
});

test('FE-12 (b): pago rechazado (titular OTHE) → error visible, sin navegar, sigue común', async ({
  page,
}) => {
  const session = await createFreshCommonUser('rechazado');
  await loginAs(page, session);
  await openBrickWallet(page);

  await fillBrickCard(page, 'OTHE');
  await submitBrick(page);

  // El rechazo (400 del backend) debe mostrarse y NO navegar a success.
  // El copy exacto del mensaje lo confirma el programador contra el DOM
  // real de Bricks; este patrón cubre toast de la app o error del Brick.
  await expect(
    page.getByText(/rechaz|error|deneg|declin/i).first(),
  ).toBeVisible({ timeout: 90000 });
  await expect(page).toHaveURL(/membership-payment/);
  await expect(await getMyType(session.accessToken)).toBe('common');
});

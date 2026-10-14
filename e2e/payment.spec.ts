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
// DECISIONES (tester, ronda 4/5 — login-first):
// - Seed en beforeAll vía API REST contra el backend REAL que levanta el CI
//   (VITE_API_BASE_URL o http://localhost:3000): UN solo admin compartido
//   con email FIJO + membresía $1500 + un usuario común con email FIJO por
//   test (aislamiento premium). DB CI efímera y vacía (lección de BE-11).
// - LOGIN-FIRST (evidencia CI run 38586896354): el limiter es 5 req/15min/IP
//   con IP de egress compartida entre runs, y cada reintento de register
//   consume cuota. Por eso se intenta `login` PRIMERO y solo si da 401/404
//   se hace UN `register`. Re-runs: todo login (0 registros). Primer run:
//   3 registros < 5. Si register da 400 (carrera entre los 2 workers por el
//   admin compartido) → login. Si register da 429 → esperar 60s UNA vez y
//   reintentar login (el usuario puede existir ya); si sigue 429, fallar con
//   mensaje rate-limit explícito (no bug del flujo de pago). Sin reintentos
//   ciegos: queman cuota y el segundo test arrancaba ya bloqueado.
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
// - Selectores VERIFICADOS del Brick cardPayment (locale es-AR, sonda local
//   contra el SDK con la misma public key TEST, sin backend): los 3 campos
//   seguros viven en iframes `https://secure-fields.mercadopago.com/`, UNO
//   visible por iframe (los demás tienen clase `hide`). Se buscan global
//   (`page.frameLocator('iframe')`, sin filtrar por `#wallet_container`:
//   los iframes son del SDK) con `input[name="cardNumber"]:visible`,
//   `input[name="expirationDate"]:visible` (formato corto MM/AA, maxlength 5)
//   e `input[name="securityCode"]:visible`. Titular, documento y email viven
//   en el frame principal: `input[name="HOLDER_NAME"]` (placeholder
//   "María López"), un `select` de tipo de documento (DNI/Cédula/L.C./L.E./
//   Otro → elegir DNI), `input[name="DOCUMENT"]`, `input[name="EMAIL"]`.
//   Submit: botón del frame principal con texto /pagar/i. Si el select de
//   cuotas/installments aparece con valores, se elige 1.
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

// Emails FIJOS por test (login-first): re-runs resuelven todo con login
// (0 registros) sin quemar cuota del limiter. Distintos por test para que
// los 2 workers no colisionen entre sí; el admin compartido se resuelve
// con lock simple (register 400-existe → login).
const ADMIN_EMAIL = 'fe12_admin@test.com';
const APROBADO_EMAIL = 'fe12_aprobado@test.com';
const RECHAZADO_EMAIL = 'fe12_rechazado@test.com';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryLogin(
  ctx: APIRequestContext,
  email: string,
): Promise<Session | null> {
  const login = await ctx.post(`${API_BASE}/auth/login`, {
    data: { emailOrUsername: email, password: TEST_PASSWORD },
  });
  if (login.ok()) {
    const body = await login.json();
    return {
      user: body.user,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    };
  }
  if (login.status() === 401 || login.status() === 404) return null;
  if (login.status() === 429) {
    throw new Error(
      `Seed: rate-limit del backend (429 en login) para ${email}. ` +
        `Es rate-limit, no bug del flujo de pago. Reintentar el job más tarde.`,
    );
  }
  throw new Error(
    `Seed: login falló (${login.status()}) para ${email}: ${await login.text()}`,
  );
}

// Login-first: login → (solo si 401/404) un register → 400-existe se
// resuelve con login, 429 espera 60s UNA vez y reintenta login.
async function ensureSeedUser(
  ctx: APIRequestContext,
  data: Record<string, string>,
): Promise<Session> {
  const existing = await tryLogin(ctx, data.email);
  if (existing) return existing;
  const reg = await ctx.post(`${API_BASE}/auth/register`, { data });
  if (reg.ok()) {
    const body = await reg.json();
    return {
      user: body.user,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    };
  }
  if (reg.status() === 400) {
    // Carrera entre workers (admin compartido) o usuario ya creado:
    // existe → login.
    const retry = await tryLogin(ctx, data.email);
    if (retry) return retry;
    throw new Error(
      `Seed: register dio 400 pero login posterior no encontró a ${data.email}`,
    );
  }
  if (reg.status() === 429) {
    await sleep(60_000);
    try {
      const retry = await tryLogin(ctx, data.email);
      if (retry) return retry;
    } catch (error) {
      throw new Error(
        `Seed: rate-limit del backend (429 en register para ${data.email}, persiste tras esperar 60s). ` +
          `Es rate-limit, no bug del flujo de pago. Reintentar el job más tarde. Causa: ${(error as Error).message}`,
      );
    }
    throw new Error(
      `Seed: rate-limit del backend (429 en register para ${data.email}, tras esperar 60s el usuario sigue sin existir). ` +
        `Es rate-limit, no bug del flujo de pago. Reintentar el job más tarde.`,
    );
  }
  throw new Error(
    `Seed: register falló (${reg.status()}) para ${data.email}: ${await reg.text()}`,
  );
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

async function getSeedCommonUser(email: string, tag: string): Promise<Session> {
  return ensureSeedUser(api, {
    userName: `fe12_${tag}`,
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

const BRICK_TIMEOUT = 30000;

async function fillSecureField(
  page: Page,
  inputName: 'cardNumber' | 'expirationDate' | 'securityCode',
  value: string,
  description: string,
): Promise<void> {
  const input = page
    .frameLocator('iframe')
    .locator(`input[name="${inputName}"]:visible`);
  try {
    await expect(input).toBeVisible({ timeout: BRICK_TIMEOUT });
    await input.fill(value, { timeout: BRICK_TIMEOUT });
  } catch (error) {
    throw new Error(
      `Brick: campo seguro "${description}" (input[name="${inputName}"] en ` +
        `iframe secure-fields) no visible/llenable en ${BRICK_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

async function fillMainField(
  page: Page,
  selector: string,
  value: string,
  description: string,
): Promise<void> {
  const input = page.locator(selector).first();
  try {
    await expect(input).toBeVisible({ timeout: BRICK_TIMEOUT });
    await input.fill(value, { timeout: BRICK_TIMEOUT });
  } catch (error) {
    throw new Error(
      `Brick: campo "${description}" (${selector}) no visible/llenable en ` +
        `${BRICK_TIMEOUT}ms. Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

async function fillBrickCard(
  page: Page,
  holderName: 'APRO' | 'OTHE',
  email: string,
): Promise<void> {
  await fillSecureField(page, 'cardNumber', TEST_CARD.number, 'número de tarjeta');
  await fillSecureField(
    page,
    'expirationDate',
    TEST_CARD.expiration,
    'vencimiento MM/AA',
  );
  await fillSecureField(page, 'securityCode', TEST_CARD.cvv, 'código de seguridad');
  await fillMainField(
    page,
    'input[name="HOLDER_NAME"]',
    holderName,
    'titular',
  );
  const docType = page.locator('select').first();
  try {
    await expect(docType).toBeVisible({ timeout: BRICK_TIMEOUT });
    await docType.selectOption({ label: 'DNI' }, { timeout: BRICK_TIMEOUT });
  } catch (error) {
    throw new Error(
      `Brick: select de tipo de documento no visible o sin opción DNI en ` +
        `${BRICK_TIMEOUT}ms. Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  await fillMainField(page, 'input[name="DOCUMENT"]', TEST_CARD.docNumber, 'documento');
  await fillMainField(page, 'input[name="EMAIL"]', email, 'email');
  // Cuotas: solo si el Brick renderiza un segundo select con valores.
  const selects = page.locator('select');
  try {
    if ((await selects.count()) >= 2) {
      const installments = selects.nth(1);
      const values = await installments
        .locator('option')
        .evaluateAll((options) =>
          options
            .map((option) => (option as unknown as { value: string }).value)
            .filter((value) => value !== ''),
        )
        .catch(() => [] as string[]);
      if (values.length > 0) {
        const target = values.includes('1') ? '1' : values[0];
        await installments.selectOption(target, { timeout: BRICK_TIMEOUT });
      }
    }
  } catch (error) {
    throw new Error(
      `Brick: no se pudo elegir 1 cuota en el select de installments. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
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
  const submit = page.getByRole('button', { name: /pagar/i }).first();
  try {
    await expect(submit).toBeVisible({ timeout: BRICK_TIMEOUT });
    await submit.click({ timeout: 15000 });
  } catch (error) {
    throw new Error(
      `Brick: botón submit (/pagar/i) no visible/clickeable en el frame ` +
        `principal. Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

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
  await ensureMembership(api);
});

test.afterAll(async () => {
  await api?.dispose();
});

test('FE-12 (a): pago aprobado con tarjeta test → /payment-status?payment_id= + estado aprobado y usuario premium', async ({
  page,
}) => {
  const session = await getSeedCommonUser(APROBADO_EMAIL, 'aprobado');
  await loginAs(page, session);
  await openBrickWallet(page);

  await fillBrickCard(page, 'APRO', APROBADO_EMAIL);
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
  const session = await getSeedCommonUser(RECHAZADO_EMAIL, 'rechazado');
  await loginAs(page, session);
  await openBrickWallet(page);

  await fillBrickCard(page, 'OTHE', RECHAZADO_EMAIL);
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

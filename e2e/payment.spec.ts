import {
  test,
  expect,
  request as baseRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

// E2E de pago REAL contra el sandbox de Mercado Pago.
// Estrategia PIVOT (orquestador + usuario, ronda 6): NO se tipea más dentro
// de los iframes secure-fields del Brick wallet. Causa raíz: carrera interna
// del widget de MP (mapeo BIN→tipo por red vs fetch de cuotas) que en el
// runner lento de CI siempre pierde; es caja negra de MP, irresoluble desde
// nuestro código. 4.5hs de evidencia en runs de CI.
//
// Qué cubre este spec (todo contra sandbox REAL, nada mockeado):
// - UI real nuestra: sesión inyectada → /membership-payment → click "Pagar y
//   convertirme en Premium" → #wallet_container visible → click botón "Pagar"
//   del Brick → métodos visibles (texto /tarjeta de crédito/i). Valida
//   preferencia real (201) + init del Brick.
// - Tokenización REAL contra API sandbox de MP (determinística):
//   POST https://api.mercadopago.com/v1/card_tokens?public_key=<KEY> con la
//   tarjeta test oficial MLA (Visa 4509953566233704, CVV 123, exp 11/2030,
//   DNI 12345678; titular APRO aprueba, OTHE rechaza) → `id` = card token.
// - Pago REAL contra nuestro backend: POST <API_BASE>/payment/process-payment
//   con { token, payment_method_id: 'visa', installments: 1,
//   identification_type: 'DNI', identification_number: '12345678' } + JWT.
// - Caso (a) aprobado: navegación UI real a
//   /payment-status?payment_id=<id> → Status Brick visible con estado
//   aprobado + GET /users/me → type === 'premium'.
// - Caso (b) rechazado: 400 + status rejected, sigue 'common', y assert UI:
//   /membership-payment muestra el botón de pago (no es premium).
//
// DECISIONES (seed login-first, se mantienen):
// - Seed en beforeAll vía API REST contra el backend REAL que levanta el CI
//   (VITE_API_BASE_URL o http://localhost:3000): UN solo admin compartido
//   con email FIJO + membresía $1500 + un usuario común con email FIJO por
//   test (aislamiento premium). DB CI efímera y vacía.
// - LOGIN-FIRST: el limiter es 5 req/15min/IP con IP de egress compartida;
//   se intenta `login` PRIMERO y solo si da 401/404 se hace UN `register`.
//   register 400 (carrera entre workers por el admin) → login. register 429
//   → esperar 60s UNA vez y reintentar login; si sigue 429, fallar explícito.
// - Sesión vía API inyectada en localStorage con addInitScript ANTES del
//   goto (mismas keys que setea el login UI: user + accessToken +
//   refreshToken). Se evita el login UI (overlay animado frágil para E2E).
// - MP_PUBLIC_KEY por env (VITE_MP_PUBLIC_KEY, misma que usa el frontend).
//   Si falta → throw explícito (el step E2E del CI debe exportarla).
// - Timeouts: 60s por paso de UI (Bricks carga scripts remotos + el backend
//   consulta a MP real). test.setTimeout 180s: sin tipeo lento ya no hacen
//   falta 5 min.

const API_BASE =
  process.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const TEST_PASSWORD = 'E2e_Test_1234';
const MEMBERSHIP_PRICE = 1500;

const TEST_CARD = {
  number: '4509953566233704',
  expirationMonth: 11,
  expirationYear: 2030,
  cvv: '123',
  docType: 'DNI',
  docNumber: '12345678',
} as const;

const MP_CARD_TOKENS_URL = 'https://api.mercadopago.com/v1/card_tokens';

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

// UI real nuestra: preferencia real (201) + init del Brick wallet. NO tipea
// dentro de los iframes de MP (ver header: pivot por carrera interna del
// widget). Solo valida que la wallet monta y ofrece los métodos de pago.
async function openWalletAndCheckMethods(page: Page): Promise<void> {
  const UI_TIMEOUT = 60000;
  try {
    await page.goto('/membership-payment');
    await expect(
      page.getByRole('heading', { name: /membresía premium/i }),
    ).toBeVisible({ timeout: 30000 });
    await page
      .getByRole('button', { name: /pagar y convertirme en premium/i })
      .click();
    await expect(page.locator('#wallet_container')).toBeVisible({
      timeout: UI_TIMEOUT,
    });
  } catch (error) {
    throw new Error(
      `Wallet paso 1/2: se esperaba /membership-payment con heading ` +
        `"Membresía Premium" + botón app "Pagar y convertirme en Premium" ` +
        `que monte #wallet_container visible en ${UI_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  try {
    const walletPay = page
      .locator('#wallet_container')
      .getByRole('button', { name: /pagar/i })
      .first();
    await expect(walletPay).toBeVisible({ timeout: UI_TIMEOUT });
    await walletPay.click({ timeout: 15000 });
    await expect(
      page.getByText(/tarjeta de crédito/i).first(),
    ).toBeVisible({ timeout: UI_TIMEOUT });
  } catch (error) {
    throw new Error(
      `Wallet paso 2/2: se esperaba UN botón "Pagar" del Brick dentro ` +
        `de #wallet_container que al clickear muestre los métodos ` +
        `(texto /tarjeta de crédito/i) en ${UI_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

// Tokenización REAL contra el sandbox de MP (determinística, tarjetas test
// oficiales MLA): titular 'APRO' aprueba, 'OTHE' rechaza. Retorna el card
// token (`body.id`). Si MP rechaza el shape, su error lo dice explícito.
async function createCardToken(cardholderName: string): Promise<string> {
  const MP_PUBLIC_KEY = process.env.VITE_MP_PUBLIC_KEY;
  if (!MP_PUBLIC_KEY) {
    throw new Error(
      'VITE_MP_PUBLIC_KEY ausente en el step E2E del CI: se necesita la ' +
        'public key TEST de MP para tokenizar contra el sandbox.',
    );
  }
  const res = await api.post(MP_CARD_TOKENS_URL, {
    params: { public_key: MP_PUBLIC_KEY },
    data: {
      card_number: TEST_CARD.number,
      expiration_month: TEST_CARD.expirationMonth,
      expiration_year: TEST_CARD.expirationYear,
      security_code: TEST_CARD.cvv,
      cardholder: {
        name: cardholderName,
        identification: {
          type: TEST_CARD.docType,
          number: TEST_CARD.docNumber,
        },
      },
    },
  });
  if (!res.ok()) {
    throw new Error(
      `MP card_tokens falló (${res.status()}) para titular ${cardholderName}: ${await res.text()}`,
    );
  }
  const body = await res.json();
  if (typeof body?.id !== 'string' || body.id.length === 0) {
    throw new Error(
      `MP card_tokens no devolvió id de token para titular ${cardholderName}: ${JSON.stringify(body)}`,
    );
  }
  return body.id as string;
}

// Pago REAL contra nuestro backend. Retorna status + body crudo para que
// cada caso aserte (200 aprobado / 400 rechazado).
async function processPaymentApi(
  tokenJWT: string,
  cardToken: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await api.post(`${API_BASE}/payment/process-payment`, {
    headers: { Authorization: `Bearer ${tokenJWT}` },
    data: {
      token: cardToken,
      payment_method_id: 'visa',
      installments: 1,
      identification_type: TEST_CARD.docType,
      identification_number: TEST_CARD.docNumber,
    },
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = { raw: await res.text() };
  }
  return { status: res.status(), body };
}

function extractPaymentId(body: Record<string, unknown>): string {
  const candidates = [
    body.paymentId,
    body.payment_id,
    (body.data as Record<string, unknown> | undefined)?.paymentId,
    (body.data as Record<string, unknown> | undefined)?.payment_id,
    (body.data as Record<string, unknown> | undefined)?.id,
  ];
  const found = candidates.find(
    (value): value is string | number =>
      typeof value === 'string' || typeof value === 'number',
  );
  if (found === undefined) {
    throw new Error(
      `process-payment 200 sin paymentId en el body: ${JSON.stringify(body)}`,
    );
  }
  return String(found);
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

test(
  'pago aprobado con tarjeta test → /payment-status?payment_id= + estado aprobado y usuario premium',
  async ({ page }) => {
    test.setTimeout(180000);
    const session = await getSeedCommonUser(APROBADO_EMAIL, 'aprobado');
    await loginAs(page, session);
    await openWalletAndCheckMethods(page);

    const cardToken = await createCardToken('APRO');
    const { status, body } = await processPaymentApi(
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
    await expect(await getMyType(session.accessToken)).toBe('premium');
  },
);

test(
  'pago rechazado (titular OTHE) → 400 rejected, sigue común, /membership-payment muestra botón de pago',
  async ({ page }) => {
    test.setTimeout(180000);
    const session = await getSeedCommonUser(RECHAZADO_EMAIL, 'rechazado');
    await loginAs(page, session);
    // La wallet monta también para otro usuario: la UI no depende del usuario.
    await openWalletAndCheckMethods(page);

    const cardToken = await createCardToken('OTHE');
    const { status, body } = await processPaymentApi(
      session.accessToken,
      cardToken,
    );
    expect(
      status,
      `process-payment rechazado: se esperaba 400, body: ${JSON.stringify(body)}`,
    ).toBe(400);
    expect(JSON.stringify(body)).toMatch(/reject/i);
    await expect(await getMyType(session.accessToken)).toBe('common');

    // Assert UI: sigue común → /membership-payment ofrece el botón de pago
    // (no es premium). NO se navega a payment-status en este caso.
    await page.goto('/membership-payment');
    await expect(
      page.getByRole('button', { name: /pagar y convertirme en premium/i }),
    ).toBeVisible({ timeout: 60000 });
  },
);

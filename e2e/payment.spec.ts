import {
  test,
  expect,
  request as baseRequest,
  type APIRequestContext,
  type Locator,
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
// - Selectores VERIFICADOS del Brick wallet (locale es-AR, sonda local
//   contra el SDK con la misma public key TEST, flujo completo reproducido):
//   1) botón app "Pagar y convertirme en Premium" → #wallet_container con UN
//   botón "Pagar" del Brick (sin campos todavía); 2) click en ese botón
//   (dentro de #wallet_container, primero) → selector de medios (Mercado
//   Pago, Crédito de Mercado Pago, Tarjeta de crédito, Tarjeta de débito,
//   Efectivo); 3) click en "Tarjeta de crédito" → RECIÉN AHÍ los 3 campos
//   seguros en iframes `https://secure-fields.mercadopago.com/`, UNO
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
  // Crudo sin barra: la máscara MM/AA la pone el Brick; el `/` literal puede romperla.
  expiration: '1130',
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

// Evidencia CI run 38596698871: `frameLocator('iframe[src*="secure-fields"]')`
// resuelve a 3 frames (mismo src) y el strict-mode falla A NIVEL FRAME en el
// `fill`, así que ningún `.first()` sobre el input interno lo evita. Por eso
// se itera `page.frames()` en JS, se filtra por
// `frame.url().includes('secure-fields')` y en cada frame se evalúa
// `frame.locator('input[name="X"]:visible').count()` (`count()` no dispara
// strict-mode). Se retorna `frame.locator(...).first()` del PRIMER frame con
// count > 0 (hay exactamente uno visible por vez: los demás tienen clase
// `hide`). Operar vía ese `frame.locator` es scope de un solo frame, donde
// el strict a nivel frame es imposible.
async function findVisibleSecureInput(
  page: Page,
  inputName: string,
): Promise<Locator | null> {
  for (const frame of page.frames()) {
    try {
      if (!frame.url().includes('secure-fields')) continue;
      const visible = await frame
        .locator(`input[name="${inputName}"]:visible`)
        .count();
      if (visible > 0) {
        return frame.locator(`input[name="${inputName}"]:visible`).first();
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fillSecureField(
  page: Page,
  inputName: 'cardNumber' | 'expirationDate' | 'securityCode',
  value: string,
  description: string,
): Promise<void> {
  // Poll sobre conteo (0/1) con la misma técnica: resuelve el input visible
  // en UN solo frame; `count()` no dispara strict-mode ni sufre detaches.
  const countVisible = async (): Promise<number> =>
    (await findVisibleSecureInput(page, inputName)) === null ? 0 : 1;
  try {
    await expect
      .poll(countVisible, { timeout: BRICK_TIMEOUT, intervals: [1000] })
      .toBeGreaterThan(0);
  } catch (error) {
    throw new Error(
      `Brick: campo seguro "${description}" (input[name="${inputName}"] en ` +
        `iframe secure-fields) no visible/llenable en ${BRICK_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  // El Brick re-monta los iframes entre poll y tipeo: re-resolver el frame
  // en cada intento y reintentar hasta 3 veces ante detach. Tipeo REAL
  // (click + pressSequentially): el `.fill()` programático pone el valor en
  // el DOM pero NO dispara los handlers JS del Brick (detección de BIN por
  // keystrokes → issuer + cuotas), así que el Brick veía los campos vacíos
  // (`incomplete_fields`, sin requests card_tokens/process-payment).
  let lastTypeCause = 'sin intentos de tipeo';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const target = await findVisibleSecureInput(page, inputName);
      if (!target) {
        throw new Error('input visible no resuelto en ningún frame secure-fields');
      }
      await target.click({ timeout: BRICK_TIMEOUT });
      await target.pressSequentially(value, {
        delay: 30,
        timeout: BRICK_TIMEOUT,
      });
      return;
    } catch (error) {
      lastTypeCause = `intento ${attempt}: ${(error as Error).message.split('\n')[0]}`;
    }
  }
  throw new Error(
    `Brick: campo seguro "${description}" (input[name="${inputName}"] en ` +
      `iframe secure-fields) no visible/llenable en ${BRICK_TIMEOUT}ms tras 3 intentos. ` +
      `Última causa: ${lastTypeCause}`,
  );
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
    // Tipeo real también en el frame principal: el Brick escucha
    // keydown/keypress/keyup; `.fill()` no los dispara.
    await input.click({ timeout: BRICK_TIMEOUT });
    await input.pressSequentially(value, {
      delay: 30,
      timeout: BRICK_TIMEOUT,
    });
  } catch (error) {
    throw new Error(
      `Brick: campo "${description}" (${selector}) no visible/llenable en ` +
        `${BRICK_TIMEOUT}ms. Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

async function retypeSecureTail(
  page: Page,
  inputName: 'cardNumber' | 'expirationDate' | 'securityCode',
  tail: string,
  description: string,
): Promise<void> {
  // Re-fetch forzado de cuotas: con el número COMPLETO ya tipeado y el logo
  // VISA visible, el fetch temprano de installments ya salió con
  // `payment_type_id` vacío y el Brick no lo reintenta (select vacío para
  // siempre). Borrar los últimos 4 (Backspace x4, NO select-all: eso
  // borraría todo) y re-tipearlos genera eventos de cambio con el tipo ya
  // resuelto y dispara un nuevo fetch con `payment_type_id` correcto.
  let lastCause = 'sin intentos de tipeo';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const target = await findVisibleSecureInput(page, inputName);
      if (!target) {
        throw new Error('input visible no resuelto en ningún frame secure-fields');
      }
      for (let i = 0; i < 4; i += 1) {
        await target.press('Backspace', { timeout: BRICK_TIMEOUT });
      }
      await target.pressSequentially(tail, {
        delay: 30,
        timeout: BRICK_TIMEOUT,
      });
      return;
    } catch (error) {
      lastCause = `intento ${attempt}: ${(error as Error).message.split('\n')[0]}`;
    }
  }
  throw new Error(
    `Brick: re-tipeo "${description}" (input[name="${inputName}"] en ` +
      `iframe secure-fields) no tipeable en ${BRICK_TIMEOUT}ms tras 3 intentos. ` +
      `Última causa: ${lastCause}`,
  );
}

async function waitForBinResolution(page: Page): Promise<void> {
  // DESPUÉS del número completo (no entre tandas): se llama con los 16
  // dígitos ya tipeados. Causa raíz CI (run 38617172422: con solo 8 dígitos
  // tipeados el logo VISA no aparece en 60s; en CI la detección del BIN
  // necesita el número completo, el screenshot con logo lo mostraba con los
  // 16 dígitos). Tipear todo de una tampoco alcanza solo: el fetch temprano
  // de installments ya salió con `payment_type_id` vacío y el Brick no lo
  // reintenta (select vacío para siempre). Por eso la secuencia es número
  // completo → espera de logo aquí → re-tipeo de la cola (re-fetch con tipo
  // resuelto, en fillBrickCard).
  // ÚNICA espera aquí: logo VISA visible (poll 60s de img/svg con alt o
  // aria-label /visa/i en página o iframes). Sin fallback a cuotas: el poll de
  // options de cuotas vive DESPUÉS (en fillBrickCard) y duplicarlo aquí
  // escondería el mismo síntoma.
  const countVisaLogo = async (): Promise<number> => {
    let total = 0;
    try {
      total += await page
        .locator(
          'img[alt*="visa" i]:visible, img[aria-label*="visa" i]:visible, svg[aria-label*="visa" i]:visible',
        )
        .count();
    } catch {
      // Seguir con los frames.
    }
    for (const frame of page.frames()) {
      try {
        total += await frame
          .locator(
            'img[alt*="visa" i]:visible, img[aria-label*="visa" i]:visible, svg[aria-label*="visa" i]:visible',
          )
          .count();
        if (total > 0) return total;
      } catch {
        continue;
      }
    }
    return total;
  };
  try {
    await expect
      .poll(countVisaLogo, { timeout: 60000, intervals: [1000] })
      .toBeGreaterThan(0);
    return;
  } catch (error) {
    throw new Error(
      'BIN no resolvió tras número completo (sin logo VISA visible 60s ' +
        `tras tipear los 16 dígitos; el re-fetch de cuotas saldría sin payment_type_id). ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
}

async function fillBrickCard(
  page: Page,
  holderName: 'APRO' | 'OTHE',
  email: string,
): Promise<void> {
  // Orden con dependencias del Brick: número COMPLETO de una → espera de
  // logo VISA (BIN resuelto, payment_type_id conocido) → re-tipeo de la cola
  // para forzar re-fetch de cuotas. Evidencia CI run 38617172422: con solo 8
  // dígitos tipeados el logo VISA no aparece en 60s (en CI la detección del
  // BIN necesita el número completo). Pero tipear todo de una tampoco alcanza
  // solo: el fetch temprano de installments ya salió con `payment_type_id`
  // vacío y el Brick no lo reintenta → select vacío para siempre. Por eso,
  // tras el número completo y el logo VISA, se fuerza un re-fetch RE-tipeando
  // los últimos 4 dígitos (Backspace x4 + pressSequentially de los mismos 4):
  // genera cambios con el tipo ya resuelto y dispara un nuevo fetch con
  // `payment_type_id` correcto. Recién después: poll de cuotas + select +
  // verificación de persistencia.
  // Tipeo REAL con pressSequentially (`.fill()` no dispara los handlers del
  // Brick y reporta `incomplete_fields` sin requests).
  const cardTail = TEST_CARD.number.slice(-4); // 3704: cola para re-fetch
  await fillSecureField(page, 'cardNumber', TEST_CARD.number, 'número de tarjeta (completo)');
  // Número completo tipeado: ÚNICA espera de logo (sin gate separado previo a
  // cuotas; el poll de options de cuotas viene después).
  await waitForBinResolution(page);
  // Número completo + VISA visible: forzar re-fetch de cuotas re-tipeando la
  // cola (el fetch temprano ya salió sin payment_type_id y no se reintenta solo).
  await retypeSecureTail(page, 'cardNumber', cardTail, 'número de tarjeta (cola, re-fetch)');
  // Cuotas OBLIGATORIAS: el Brick exige cuotas seleccionadas (sin cuotas →
  // `incomplete_fields` → nunca sale `card_tokens`). El select se puebla async
  // tras el re-fetch, así que se espera hasta 60s a que el 2º select tenga
  // options con valores. Si no se puebla: error explícito, no seguir.
  const selects = page.locator('select');
  const installmentSelect = selects.nth(1);
  const countInstallmentValues = async (): Promise<number> => {
    try {
      if ((await selects.count()) < 2) return 0;
      const values = await installmentSelect
        .locator('option')
        .evaluateAll((options) =>
          options
            .map((option) => (option as unknown as { value: string }).value)
            .filter((value) => value !== ''),
        )
        .catch(() => [] as string[]);
      return values.length;
    } catch {
      return 0;
    }
  };
  try {
    await expect
      .poll(countInstallmentValues, {
        timeout: 60000,
        intervals: [1000],
      })
      .toBeGreaterThan(0);
  } catch (error) {
    throw new Error(
      `Brick: cuotas no se poblaron tras re-tipeo de la cola (el 2º select no tiene ` +
        `options con valores 60s después del re-fetch forzado con payment_type_id ` +
        `resuelto; sin issuer/cuotas el submit saldría como incomplete_fields). ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  let chosenInstallment = '';
  let persistedInstallment = false;
  for (let round = 1; round <= 3 && !persistedInstallment; round += 1) {
    try {
      const values = await installmentSelect
        .locator('option')
        .evaluateAll((options) =>
          options
            .map((option) => (option as unknown as { value: string }).value)
            .filter((value) => value !== ''),
        );
      chosenInstallment = values.includes('1') ? '1' : values[0];
      await installmentSelect.selectOption(chosenInstallment, {
        timeout: BRICK_TIMEOUT,
      });
    } catch (error) {
      throw new Error(
        `Brick: no se pudo elegir ${chosenInstallment || '1'} cuota(s) en el select de installments. ` +
          `Causa: ${(error as Error).message.split('\n')[0]}`,
      );
    }
    // PERSISTENCIA: en CI lento las options aparecen ANTES de que termine
    // la detección del BIN; elegir '1' sobre options transitorias se pierde
    // en silencio cuando el Brick recarga las definitivas (el inputValue()
    // verificado era del select viejo) → submit sin cuotas →
    // `incomplete_fields`. Por eso se exige que el valor siga siendo '1' en
    // 3 lecturas seguidas separadas 2s (poll hasta 20s); si se pierde se
    // re-selecciona, hasta 3 rondas.
    const readInstallment = async (): Promise<string> => {
      try {
        return await installmentSelect.inputValue();
      } catch {
        return '__unresolved__';
      }
    };
    try {
      await expect
        .poll(readInstallment, { timeout: 20000, intervals: [1000] })
        .toBe(chosenInstallment);
    } catch (error) {
      if (round === 3) {
        throw new Error(
          `Brick: cuotas no persisten tras detección BIN (ronda ${round}/3: ` +
            `inputValue() no volvió a "${chosenInstallment}" en 20s). ` +
            `Causa: ${(error as Error).message.split('\n')[0]}`,
        );
      }
      continue;
    }
    let stable = true;
    for (let read = 0; read < 3; read += 1) {
      await sleep(2000);
      const selected = await readInstallment();
      if (selected !== chosenInstallment) {
        stable = false;
        break;
      }
    }
    if (stable) {
      persistedInstallment = true;
    } else if (round === 3) {
      throw new Error(
        `Brick: cuotas no persisten tras detección BIN (la selección ` +
          `"${chosenInstallment}" se perdió en 3 lecturas seguidas separadas ` +
          `2s tras 3 rondas de re-selección; el Brick recargó las options ` +
          `definitivas y el submit saldría como incomplete_fields).`,
      );
    }
  }
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
}

async function openBrickWallet(page: Page): Promise<void> {
  // FE-12: secuencia VERIFICADA del Brick wallet (sonda contra el SDK con la
  // misma public key TEST, flujo completo reproducido). El Brick wallet tiene
  // pasos intermedios: sin ellos no existen los iframes secure-fields.
  const STEP_TIMEOUT = 60000;
  // Paso 1: botón de la app → se crea la preferencia → aparece
  // #wallet_container con UN botón "Pagar" del Brick (sin campos todavía).
  try {
    await page.goto('/membership-payment');
    await expect(
      page.getByRole('heading', { name: /membresía premium/i }),
    ).toBeVisible({ timeout: 30000 });
    await page
      .getByRole('button', { name: /pagar y convertirme en premium/i })
      .click();
    await expect(page.locator('#wallet_container')).toBeVisible({
      timeout: STEP_TIMEOUT,
    });
  } catch (error) {
    throw new Error(
      `Brick wallet paso 1/3: se esperaba /membership-payment con heading ` +
        `"Membresía Premium" + botón app "Pagar y convertirme en Premium" ` +
        `que monte #wallet_container visible en ${STEP_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  // Paso 2: click en el botón "Pagar" del Brick dentro de #wallet_container
  // (el primero) → aparece el selector de medios (Mercado Pago, Crédito de
  // Mercado Pago, Tarjeta de crédito, Tarjeta de débito, Efectivo).
  try {
    const walletPay = page
      .locator('#wallet_container')
      .getByRole('button', { name: /pagar/i })
      .first();
    await expect(walletPay).toBeVisible({ timeout: STEP_TIMEOUT });
    await walletPay.click({ timeout: 15000 });
    await expect(
      page.getByText(/tarjeta de crédito/i).first(),
    ).toBeVisible({ timeout: STEP_TIMEOUT });
  } catch (error) {
    throw new Error(
      `Brick wallet paso 2/3: se esperaba UN botón "Pagar" del Brick dentro ` +
        `de #wallet_container que al clickear muestre el selector de medios ` +
        `(Mercado Pago, Tarjeta de crédito, Tarjeta de débito, Efectivo) ` +
        `en ${STEP_TIMEOUT}ms. ` +
        `Causa: ${(error as Error).message.split('\n')[0]}`,
    );
  }
  // Paso 3: UN SOLO click a "Tarjeta de crédito" POR TEXTO (selector
  // verificado, funciona en local) + UN SOLO poll largo (180s) de cardNumber
  // visible con conteo (misma técnica anti strict-mode). Sin re-clicks: cada
  // click re-selecciona el método y reinicia el formulario del Brick,
  // borrando lo ya montado/tipeado (evidencia CI: wallet reseteada a
  // selección de método, prístina). El timeout de test es 300s, así que el
  // poll de 180s entra.
  try {
    // Poll sobre conteo con UN solo frame (findVisibleSecureInput): el Brick
    // re-renderiza los iframes y `frameLocator('iframe...')` resuelve a 3
    // frames con el mismo src, lo que rompe por strict-mode A NIVEL FRAME
    // aunque cardNumber YA esté visible. `count()` dentro de cada frame no
    // dispara strict-mode ni sufre detaches.
    const countCardNumber = async (): Promise<number> =>
      (await findVisibleSecureInput(page, 'cardNumber')) === null ? 0 : 1;
    const dumpSecureFields = async (): Promise<string> => {
      const states: string[] = [];
      for (const frame of page.frames()) {
        const inputs = await frame
          .locator('input[name]')
          .evaluateAll((elements) =>
            elements.map((element) => {
              const input = element as unknown as {
                getAttribute: (name: string) => string | null;
                getBoundingClientRect: () => { width: number; height: number };
                disabled: boolean;
              };
              const rect = input.getBoundingClientRect();
              return {
                name: input.getAttribute('name') ?? '',
                className: input.getAttribute('class') ?? '',
                visible: rect.width > 0 && rect.height > 0 && !input.disabled,
              };
            }),
          )
          .catch(() => [] as Array<{ name: string; className: string; visible: boolean }>);
        if (inputs.length > 0) {
          states.push(
            `${frame.url()} :: ${inputs
              .map(
                (item) =>
                  `${item.name}[class="${item.className}" visible=${item.visible}]`,
              )
              .join(', ')}`,
          );
        }
      }
      return states.length > 0 ? states.join('\n') : '(sin inputs en iframes)';
    };
    const creditOption = page.getByText(/tarjeta de crédito/i).first();
    await expect(creditOption).toBeVisible({ timeout: STEP_TIMEOUT });
    await creditOption.click({ timeout: 15000 });
    try {
      await expect
        .poll(countCardNumber, { timeout: 180000, intervals: [1000] })
        .toBeGreaterThan(0);
    } catch {
      const dump = await dumpSecureFields();
      console.log(
        `Brick wallet paso 3/3: estado secure-fields tras poll único de 180s:\n${dump}`,
      );
      throw new Error(
        `Brick wallet paso 3/3: tras UN click a "Tarjeta de crédito" por texto ` +
          `(poll único de 180s) no apareció ` +
          `input[name="cardNumber"]:visible. ` +
          `Estado secure-fields:\n${dump}`,
      );
    }
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes('Estado secure-fields:')) throw error as Error;
    throw new Error(
      `Brick wallet paso 3/3: se esperaba la opción "Tarjeta de crédito" ` +
        `del selector de medios que al clickearla por texto (UN click + poll ` +
        `único de 180s) monte los 3 iframes ` +
        `secure-fields con input[name="cardNumber"] visible ` +
        `en ${STEP_TIMEOUT}ms. ` +
        `Causa: ${message.split('\n')[0]}`,
    );
  }
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

test(
  'FE-12 (a): pago aprobado con tarjeta test → /payment-status?payment_id= + estado aprobado y usuario premium',
  async ({ page }) => {
    test.setTimeout(300000);
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
  },
);

test(
  'FE-12 (b): pago rechazado (titular OTHE) → error visible, sin navegar, sigue común',
  async ({ page }) => {
    test.setTimeout(300000);
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
  },
);

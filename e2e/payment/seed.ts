import type { APIRequestContext, Page } from '@playwright/test';

// Seed del E2E de pago: prepara el mundo antes de probar (admin,
// membresía, usuarios, sesión) contra el backend REAL que levanta el CI.
// Login-first: el backend limita registros (5 req/15min/IP), así que se
// intenta login PRIMERO y solo si da 401/404 se registra. Emails fijos:
// los re-runs resuelven todo con login (0 registros). Requiere DB
// efímera: los usuarios quedan creados (y uno termina en premium).

export const API_BASE =
  process.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
export const TEST_PASSWORD = 'E2e_Test_1234';
export const MEMBERSHIP_PRICE = 1500;

export const ADMIN_EMAIL = 'fe12_admin@test.com';
export const APROBADO_EMAIL = 'fe12_aprobado@test.com';
export const RECHAZADO_EMAIL = 'fe12_rechazado@test.com';

export interface Session {
  user: unknown;
  accessToken: string;
  refreshToken: string;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function tryLogin(
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
export async function ensureSeedUser(
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

export async function ensureMembership(
  ctx: APIRequestContext,
  adminToken: string,
): Promise<void> {
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

export async function getSeedCommonUser(
  ctx: APIRequestContext,
  email: string,
  tag: string,
): Promise<Session> {
  return ensureSeedUser(ctx, {
    userName: `fe12_${tag}`,
    realName: 'FE12 E2E User',
    email,
    password: TEST_PASSWORD,
  });
}

export async function loginAs(page: Page, session: Session): Promise<void> {
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

export async function getMyType(
  ctx: APIRequestContext,
  token: string,
): Promise<string> {
  const res = await ctx.get(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET /users/me falló (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body?.data?.type as string;
}

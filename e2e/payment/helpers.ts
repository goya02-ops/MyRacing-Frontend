import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { API_BASE } from './seed';

// Pasos del pago (todo contra sandbox REAL, nada mockeado): wallet UI
// real (preferencia + métodos, sin tipear en los iframes de MP) +
// tokenización por API sandbox + process-payment real al backend.

export const TEST_CARD = {
  number: '4509953566233704',
  expirationMonth: 11,
  expirationYear: 2030,
  cvv: '123',
  docType: 'DNI',
  docNumber: '12345678',
} as const;

const MP_CARD_TOKENS_URL = 'https://api.mercadopago.com/v1/card_tokens';

// UI real nuestra: preferencia real + init del Brick wallet. Solo valida
// que la wallet monta y ofrece los métodos de pago.
export async function openWalletAndCheckMethods(page: Page): Promise<void> {
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
// oficiales): titular 'APRO' aprueba, 'OTHE' rechaza. Retorna el card
// token (`body.id`). Si MP rechaza el shape, su error lo dice explícito.
export async function createCardToken(
  ctx: APIRequestContext,
  cardholderName: string,
): Promise<string> {
  const MP_PUBLIC_KEY = process.env.VITE_MP_PUBLIC_KEY;
  if (!MP_PUBLIC_KEY) {
    throw new Error(
      'VITE_MP_PUBLIC_KEY ausente en el step E2E del CI: se necesita la ' +
        'public key TEST de MP para tokenizar contra el sandbox.',
    );
  }
  const res = await ctx.post(MP_CARD_TOKENS_URL, {
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
export async function processPaymentApi(
  ctx: APIRequestContext,
  tokenJWT: string,
  cardToken: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await ctx.post(`${API_BASE}/payment/process-payment`, {
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

export function extractPaymentId(body: Record<string, unknown>): string {
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

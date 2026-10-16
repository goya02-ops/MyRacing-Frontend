import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from './apiClient';
import { processPayment } from './membershipService';
import { API_ROUTES } from './apiRoutes';

vi.mock('./apiClient', () => ({
  fetchWithAuth: vi.fn(),
}));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

function mockResponse(ok: boolean, body: unknown): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function mockUnparseableResponse(): Response {
  return {
    ok: false,
    status: 400,
    json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
  } as unknown as Response;
}

describe('membershipService processPayment', () => {
  beforeEach(() => {
    mockFetchWithAuth.mockReset();
  });

  it('éxito: devuelve el resultado y llama al endpoint con el form serializado', async () => {
    const formData = { membershipId: 1, token: 'card-token' };
    const result = { paymentId: 'pay-123', status: 'approved' };
    mockFetchWithAuth.mockResolvedValue(mockResponse(true, result));

    await expect(processPayment(formData)).resolves.toEqual(result);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(API_ROUTES.PAYMENT.PROCESS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  });

  it('rechazo: lanza el mensaje del servidor con paymentId y status adjuntos', async () => {
    const formData = { membershipId: 1, token: 'card-token' };
    mockFetchWithAuth.mockResolvedValue(
      mockResponse(false, {
        message: 'Tarjeta rechazada',
        paymentId: 'pay-456',
        status: 'rejected',
      })
    );

    const failure = await processPayment(formData).then(
      () => null,
      (error: unknown) => error as Error & { paymentId?: string; status?: string }
    );

    expect(failure).toBeInstanceOf(Error);
    expect(failure?.message).toBe('Tarjeta rechazada');
    expect(failure?.paymentId).toBe('pay-456');
    expect(failure?.status).toBe('rejected');
  });

  it('error sin JSON útil: lanza el fallback por defecto', async () => {
    const formData = { membershipId: 1, token: 'card-token' };
    mockFetchWithAuth.mockResolvedValue(mockUnparseableResponse());

    await expect(processPayment(formData)).rejects.toThrow(
      'Error al procesar el pago.'
    );
  });
});

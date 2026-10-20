import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  API_BASE_URL,
  fetchWithAuth,
  getAuthHeaders,
  setAuthFailureHandler,
} from './apiClient';

describe('apiClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    setAuthFailureHandler(null);
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAuthHeaders', () => {
    it('retorna solo Content-Type cuando no hay token en localStorage', () => {
      const headers = getAuthHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('incluye Authorization Bearer cuando existe accessToken en localStorage', () => {
      localStorage.setItem('accessToken', 'test-token-123');
      const headers = getAuthHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-123',
      });
    });
  });

  describe('fetchWithAuth - peticiones exitosas', () => {
    it('realiza la petición con la URL base y headers por defecto si no hay token', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      const response = await fetchWithAuth('/circuits');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/circuits`,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(response.status).toBe(200);
    });

    it('agrega el header Authorization cuando hay un accessToken en localStorage', async () => {
      localStorage.setItem('accessToken', 'valid-access-token');
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      const response = await fetchWithAuth('/circuits');

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/circuits`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-access-token',
          }),
        })
      );
      expect(response.status).toBe(200);
    });

    it('conserva headers y opciones personalizadas de la petición', async () => {
      localStorage.setItem('accessToken', 'my-token');
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 201 })
      );

      const body = JSON.stringify({ name: 'Monza' });
      await fetchWithAuth('/circuits', {
        method: 'POST',
        headers: { 'X-Custom-Header': 'custom-val' },
        body,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/circuits`,
        expect.objectContaining({
          method: 'POST',
          body,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-val',
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });
  });

  describe('fetchWithAuth - flujo de error 401 y refresh de token', () => {
    it('refresca el token ante un 401 y reintenta la petición con el nuevo token', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // 1. Primera petición da 401
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      );

      // 2. Llamada a /auth/refresh devuelve nuevo access token
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ accessToken: 'new-refreshed-token' }),
          { status: 200 }
        )
      );

      // 3. Reintento de la petición original con el nuevo token devuelve 200
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'circuit-data' }), { status: 200 })
      );

      const response = await fetchWithAuth('/circuits');
      const data = await response.json();

      expect(fetchMock).toHaveBeenCalledTimes(3);

      // Verificación de la llamada a /auth/refresh
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `${API_BASE_URL}/auth/refresh`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
        })
      );

      // Verificación del reintento con el nuevo token
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        `${API_BASE_URL}/circuits`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer new-refreshed-token',
          }),
        })
      );

      expect(localStorage.getItem('accessToken')).toBe('new-refreshed-token');
      expect(data).toEqual({ data: 'circuit-data' });
    });
  });

  describe('fetchWithAuth - refresh queue con peticiones concurrentes', () => {
    it('encola peticiones concurrentes que dan 401 y las reintenta a todas tras un único refresh', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      let resolveRefreshPromise: (response: Response) => void;
      const refreshDeferred = new Promise<Response>((resolve) => {
        resolveRefreshPromise = resolve;
      });

      fetchMock.mockImplementation((url: string, init?: RequestInit) => {
        if (url.includes('/auth/refresh')) {
          return refreshDeferred;
        }

        const authHeader = (init?.headers as Record<string, string>)?.[
          'Authorization'
        ];

        // Reintentos con nuevo token responden 200
        if (authHeader === 'Bearer new-token-for-all') {
          return Promise.resolve(
            new Response(JSON.stringify({ url, reattempted: true }), { status: 200 })
          );
        }

        // Peticiones iniciales con token viejo responden 401
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
        );
      });

      // Disparamos la primera petición que iniciará el refresh
      const request1Promise = fetchWithAuth('/races');

      // Esperamos un tick para que la primera petición reciba el 401 y active isRefreshing = true
      await Promise.resolve();

      // Disparamos peticiones adicionales mientras isRefreshing es true
      const request2Promise = fetchWithAuth('/circuits');
      const request3Promise = fetchWithAuth('/users');

      // Resolvemos el refresh pendiente
      resolveRefreshPromise!(
        new Response(
          JSON.stringify({ accessToken: 'new-token-for-all' }),
          { status: 200 }
        )
      );

      const [res1, res2, res3] = await Promise.all([
        request1Promise,
        request2Promise,
        request3Promise,
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(200);

      // Verificamos que /auth/refresh se llamó EXACTAMENTE 1 vez
      const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
        url.includes('/auth/refresh')
      );
      expect(refreshCalls.length).toBe(1);

      expect(localStorage.getItem('accessToken')).toBe('new-token-for-all');
    });
  });

  describe('fetchWithAuth - failure handler y rechazo de cola', () => {
    it('rechaza la petición, limpia localStorage y ejecuta authFailureHandler cuando el refresh expira', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'expired-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Piloto' }));

      const failureHandler = vi.fn();
      setAuthFailureHandler(failureHandler);

      // Petición inicial 401
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      );

      // Refresh falla (ej. 401 token expired)
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Refresh expired' }), {
          status: 401,
        })
      );

      await expect(fetchWithAuth('/circuits')).rejects.toThrow(
        'Refresh token expired'
      );

      expect(failureHandler).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('rechaza todas las peticiones encoladas si el refresh token falla', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'bad-refresh-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const failureHandler = vi.fn();
      setAuthFailureHandler(failureHandler);

      let rejectRefreshPromise: (response: Response) => void;
      const refreshDeferred = new Promise<Response>((resolve) => {
        rejectRefreshPromise = resolve;
      });

      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/auth/refresh')) {
          return refreshDeferred;
        }
        return Promise.resolve(
          new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
        );
      });

      const p1 = fetchWithAuth('/resource1');
      await Promise.resolve();
      const p2 = fetchWithAuth('/resource2');
      const p3 = fetchWithAuth('/resource3');

      // Hacemos que el refresh falle con !response.ok
      rejectRefreshPromise!(
        new Response(JSON.stringify({ message: 'Invalid refresh' }), {
          status: 400,
        })
      );

      await expect(p1).rejects.toThrow('Refresh token expired');
      await expect(p2).rejects.toThrow('Refresh token expired');
      await expect(p3).rejects.toThrow('Refresh token expired');

      expect(failureHandler).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('rechaza con error si no hay refresh token en localStorage ante un 401', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      // No hay refreshToken en localStorage

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      );

      await expect(fetchWithAuth('/circuits')).rejects.toThrow(
        'No refresh token'
      );
    });
  });
});

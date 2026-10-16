import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API_BASE_URL } from './apiClient';

// Mockeamos fetch global. El stub se instala en cada test (beforeEach)
// porque el afterEach hace unstubAllGlobals() y de lo contrario los
// tests 2+ usarían el fetch real (ECONNREFUSED a localhost:3000).
const mockFetch = vi.fn();

describe('authService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  describe('logout', () => {
    it('POSTea el grant a /auth/logout con el refresh guardado y limpia los tokens', async () => {
      localStorage.setItem('accessToken', 'access-1');
      localStorage.setItem('refreshToken', 'refresh-1');
      localStorage.setItem('user', JSON.stringify({ userName: 'piloto' }));
      mockFetch.mockResolvedValue({ ok: true } as unknown as Response);

      const { logout } = await import('./authService');
      await logout();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'refresh-1' }),
      });
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('sin refresh guardado limpia la sesión sin POSTear', async () => {
      localStorage.setItem('accessToken', 'access-1');

      const { logout } = await import('./authService');
      await logout();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('best-effort: si el POST falla, igual limpia y no propaga el error', async () => {
      localStorage.setItem('refreshToken', 'refresh-1');
      mockFetch.mockRejectedValue(new Error('network down'));

      const { logout } = await import('./authService');
      await expect(logout()).resolves.toBeUndefined();

      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('éxito: POST a /auth/forgot-password con JSON, sin token y devuelve data', async () => {
      const responseData = { message: 'ok' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseData),
      } as unknown as Response);

      const { forgotPassword } = await import('./authService');
      const result = await forgotPassword('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        }
      );
      expect(result).toEqual(responseData);
    });

    it('error HTTP con message: lanza Error con ese mensaje', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'X' }),
      } as unknown as Response);

      const { forgotPassword } = await import('./authService');
      await expect(forgotPassword('test@example.com')).rejects.toThrow('X');
    });

    it('error HTTP sin message: lanza fallback por defecto', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as unknown as Response);

      const { forgotPassword } = await import('./authService');
      await expect(forgotPassword('test@example.com')).rejects.toThrow(
        'Error al enviar el email de recuperación'
      );
    });
  });
});

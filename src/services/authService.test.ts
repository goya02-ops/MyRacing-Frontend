import { describe, it, expect, vi, afterEach } from 'vitest';
import { API_BASE_URL } from './apiClient';

// Mockeamos fetch global
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('authService', () => {
  afterEach(() => {
    mockFetch.mockReset();
    vi.unstubAllGlobals();
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

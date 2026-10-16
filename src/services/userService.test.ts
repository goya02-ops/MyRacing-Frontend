import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fetchMyProfile } from './userService';
import { fetchWithAuth } from './apiClient';

vi.mock('./apiClient', () => ({ fetchWithAuth: vi.fn() }));
vi.mock('./raceUserService.ts', () => ({ fetchMyRaceUsers: vi.fn() }));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

describe('userService.fetchMyProfile (BE #63: sin status crudo)', () => {
  beforeEach(() => mockFetchWithAuth.mockReset());

  it('con error usa un mensaje amigable, sin filtrar el status', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);

    await expect(fetchMyProfile()).rejects.toThrow(
      'No se pudieron obtener los datos del perfil.',
    );
  });

  it('prefiere el message del backend cuando el body es JSON', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Usuario no encontrado' }),
    } as unknown as Response);

    await expect(fetchMyProfile()).rejects.toThrow('Usuario no encontrado');
  });
});

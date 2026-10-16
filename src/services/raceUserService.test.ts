import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fetchRaceUsersByUserId } from './raceUserService';
import { fetchWithAuth } from './apiClient';

vi.mock('./apiClient', () => ({ fetchWithAuth: vi.fn() }));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

function errorResponse(
  status: number,
  json: () => Promise<unknown>,
): Response {
  return { ok: false, status, json } as unknown as Response;
}

describe('raceUserService (BE #63: sin status/body crudos)', () => {
  beforeEach(() => mockFetchWithAuth.mockReset());

  it('con body no-JSON usa un mensaje amigable, sin filtrar status ni body', async () => {
    mockFetchWithAuth.mockResolvedValue(
      errorResponse(500, () => Promise.reject(new Error('not json'))),
    );

    await expect(fetchRaceUsersByUserId(1)).rejects.toThrow(
      'No se pudieron obtener tus carreras.',
    );
  });

  it('prefiere el message del backend cuando el body es JSON', async () => {
    mockFetchWithAuth.mockResolvedValue(
      errorResponse(400, () => Promise.resolve({ message: 'Usuario no encontrado' })),
    );

    await expect(fetchRaceUsersByUserId(1)).rejects.toThrow('Usuario no encontrado');
  });

  it('éxito: devuelve data', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ id: 1 }] }),
    } as unknown as Response);

    await expect(fetchRaceUsersByUserId(1)).resolves.toEqual([{ id: 1 }]);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fetchRaceUsersByUserId, fetchMyRaceUsers } from './raceUserService';
import { fetchWithAuth } from './apiClient';
import { API_ROUTES } from './apiRoutes';

vi.mock('./apiClient', () => ({ fetchWithAuth: vi.fn() }));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

function errorResponse(
  status: number,
  json: () => Promise<unknown>,
): Response {
  return { ok: false, status, json } as unknown as Response;
}

function okResponse(payload: unknown = { data: [{ id: 1 }] }): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(payload),
  } as unknown as Response;
}

describe('raceUserService (BE #57: la firma usa el argumento)', () => {
  beforeEach(() => mockFetchWithAuth.mockReset());

  it('fetchRaceUsersByUserId consulta el endpoint admin con el userId', async () => {
    mockFetchWithAuth.mockResolvedValue(okResponse());

    await fetchRaceUsersByUserId(42);

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      API_ROUTES.RACE_USERS.BY_USER(42),
    );
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/race-users/by-user?userId=42',
    );
  });

  it('fetchMyRaceUsers consulta /my-races sin parámetros', async () => {
    mockFetchWithAuth.mockResolvedValue(okResponse());

    await fetchMyRaceUsers();

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      API_ROUTES.RACE_USERS.MY_RACES,
    );
    expect(mockFetchWithAuth).toHaveBeenCalledWith('/race-users/my-races');
  });

  it('con body no-JSON usa un mensaje amigable, sin filtrar status ni body', async () => {
    mockFetchWithAuth.mockResolvedValue(
      errorResponse(500, () => Promise.reject(new Error('not json'))),
    );

    await expect(fetchMyRaceUsers()).rejects.toThrow(
      'No se pudieron obtener tus carreras.',
    );
  });

  it('prefiere el message del backend cuando el body es JSON', async () => {
    mockFetchWithAuth.mockResolvedValue(
      errorResponse(400, () => Promise.resolve({ message: 'Usuario no encontrado' })),
    );

    await expect(fetchRaceUsersByUserId(1)).rejects.toThrow(
      'Usuario no encontrado',
    );
  });

  it('éxito: devuelve data', async () => {
    mockFetchWithAuth.mockResolvedValue(okResponse({ data: [{ id: 1 }] }));

    await expect(fetchRaceUsersByUserId(1)).resolves.toEqual([{ id: 1 }]);
  });
});

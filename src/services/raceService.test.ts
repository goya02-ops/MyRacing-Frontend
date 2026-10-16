import { describe, it, expect, vi, beforeEach } from 'vitest';

import { registerUserToRace } from './raceService';
import { fetchWithAuth } from './apiClient';
import { ApiError } from './apiError.ts';

vi.mock('./apiClient', () => ({ fetchWithAuth: vi.fn() }));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

describe('raceService.registerUserToRace (BE #63: propaga la causa)', () => {
  beforeEach(() => mockFetchWithAuth.mockReset());

  it('adjunta el status HTTP al error para poder mapearlo (409)', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: 'User already registered for this race' }),
    } as unknown as Response);

    await expect(registerUserToRace(1, 2)).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'User already registered for this race',
    });
    await expect(registerUserToRace(1, 2)).rejects.toBeInstanceOf(ApiError);
  });

  it('sin body JSON usa un mensaje amigable', async () => {
    mockFetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);

    await expect(registerUserToRace(1, 2)).rejects.toThrow('No se pudo inscribir.');
  });
});

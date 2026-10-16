import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useEntityQuery } from './useEntityQuery';
import { useEntityMutation } from './useEntityMutation';
import { createEntityKey } from '../utils/queryKeys';
import { fetchEntities, saveEntity } from '../services/apiService';
import { Simulator, Category } from '../types/entities';

vi.mock('../services/apiService', () => ({
  fetchEntities: vi.fn(),
  saveEntity: vi.fn(),
}));

const mockFetchEntities = vi.mocked(fetchEntities);
const mockSaveEntity = vi.mocked(saveEntity);

const simulator = { id: 1, name: 'Assetto Corsa', status: 'Activo' } as Simulator;

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useEntityQuery/useEntityMutation (BE #57: keys vía createEntityKey)', () => {
  beforeEach(() => {
    mockFetchEntities.mockReset();
    mockSaveEntity.mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('cachea la lista bajo la key del namespace de entidades', async () => {
    mockFetchEntities.mockResolvedValue([simulator]);

    const { result } = renderHook(() => useEntityQuery(Simulator), { wrapper });

    await waitFor(() => expect(result.current.list).toEqual([simulator]));

    expect(queryClient.getQueryData(createEntityKey(Simulator))).toEqual([
      simulator,
    ]);
  });

  it('dos clases distintas guardan en entradas distintas de la caché', async () => {
    mockFetchEntities.mockResolvedValueOnce([simulator]);
    mockFetchEntities.mockResolvedValueOnce([{ id: 2 } as Category]);

    renderHook(() => useEntityQuery(Simulator), { wrapper });
    renderHook(() => useEntityQuery(Category), { wrapper });

    await waitFor(() =>
      expect(queryClient.getQueryData(createEntityKey(Simulator))).toEqual([
        simulator,
      ]),
    );

    await waitFor(() =>
      expect(queryClient.getQueryData(createEntityKey(Category))).toEqual([
        { id: 2 },
      ]),
    );
  });

  it('la mutación invalida exactamente la key que lee el query', async () => {
    mockFetchEntities.mockResolvedValue([simulator]);
    mockSaveEntity.mockResolvedValue(simulator);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result: queryResult } = renderHook(() => useEntityQuery(Simulator), {
      wrapper,
    });
    await waitFor(() => expect(queryResult.current.list).toEqual([simulator]));

    const { result: mutationResult } = renderHook(
      () => useEntityMutation(Simulator),
      { wrapper },
    );
    await act(async () => {
      await mutationResult.current.saveEntity(simulator);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: createEntityKey(Simulator),
    });
  });
});

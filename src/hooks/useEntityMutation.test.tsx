import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEntityMutation } from './useEntityMutation';
import { deleteEntity, saveEntity } from '../services/apiService';
import { Circuit } from '../types/entities';

vi.mock('../services/apiService', () => ({
  saveEntity: vi.fn(),
  deleteEntity: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('useEntityMutation', () => {
  const saveEntityMock = vi.mocked(saveEntity);
  const deleteEntityMock = vi.mocked(deleteEntity);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ejecuta la mutación de guardado y llama a queryClient.invalidateQueries en onSuccess', async () => {
    const circuitToSave: Circuit = {
      denomination: 'Monza',
      abbreviation: 'MNZ',
      description: 'Autodromo Nacional de Monza',
    };
    const savedCircuit: Circuit = { id: 1, ...circuitToSave };

    saveEntityMock.mockResolvedValueOnce(savedCircuit);

    const { queryClient, wrapper } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEntityMutation(Circuit), { wrapper });

    expect(result.current.isSaving).toBe(false);

    let saveResult: Circuit | undefined;
    await act(async () => {
      saveResult = await result.current.saveEntity(circuitToSave);
    });

    expect(saveEntityMock).toHaveBeenCalledTimes(1);
    expect(saveEntityMock).toHaveBeenCalledWith(Circuit, circuitToSave);
    expect(saveResult).toEqual(savedCircuit);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [Circuit.name],
    });
  });

  it('ejecuta la mutación de borrado y llama a queryClient.invalidateQueries en onSuccess', async () => {
    deleteEntityMock.mockResolvedValueOnce(undefined);

    const { queryClient, wrapper } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEntityMutation(Circuit), { wrapper });

    expect(result.current.isDeleting).toBe(false);

    await act(async () => {
      await result.current.deleteEntity(5);
    });

    expect(deleteEntityMock).toHaveBeenCalledTimes(1);
    expect(deleteEntityMock).toHaveBeenCalledWith(Circuit, 5);

    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [Circuit.name],
    });
  });

  it('propaga el error y no invalida queries si la mutación de guardado falla', async () => {
    const error = new Error('Error al guardar entidad');
    saveEntityMock.mockRejectedValueOnce(error);

    const { queryClient, wrapper } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEntityMutation(Circuit), { wrapper });

    await act(async () => {
      await expect(
        result.current.saveEntity({
          denomination: 'Invalido',
          abbreviation: 'INV',
          description: '',
        })
      ).rejects.toThrow('Error al guardar entidad');
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('propaga el error y no invalida queries si la mutación de borrado falla', async () => {
    const error = new Error('Error al eliminar entidad');
    deleteEntityMock.mockRejectedValueOnce(error);

    const { queryClient, wrapper } = createWrapper();
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEntityMutation(Circuit), { wrapper });

    await act(async () => {
      await expect(result.current.deleteEntity(999)).rejects.toThrow(
        'Error al eliminar entidad'
      );
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});

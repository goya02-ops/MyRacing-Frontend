import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEntityQuery } from './useEntityQuery';
import { fetchEntities } from '../services/apiService';
import { Circuit } from '../types/entities';

vi.mock('../services/apiService', () => ({
  fetchEntities: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('useEntityQuery', () => {
  const fetchEntitiesMock = vi.mocked(fetchEntities);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna los datos de las entidades correctamente tras una respuesta exitosa', async () => {
    const mockCircuits: Circuit[] = [
      { id: 1, denomination: 'Monza', abbreviation: 'MNZ', description: 'Autodromo' },
      { id: 2, denomination: 'Silverstone', abbreviation: 'SLV', description: 'Circuito' },
    ];

    fetchEntitiesMock.mockResolvedValueOnce(mockCircuits);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEntityQuery(Circuit), { wrapper });

    // Inicialmente cargando con lista vacía por defecto
    expect(result.current.isLoading).toBe(true);
    expect(result.current.list).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.list).toEqual(mockCircuits);
    expect(fetchEntitiesMock).toHaveBeenCalledTimes(1);
    expect(fetchEntitiesMock).toHaveBeenCalledWith(Circuit);
  });

  it('maneja el estado de error cuando fetchEntities falla', async () => {
    const error = new Error('Error al conectar con la API');
    fetchEntitiesMock.mockRejectedValueOnce(error);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEntityQuery(Circuit), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(error);
    expect(result.current.list).toEqual([]);
  });

  it('retorna un array vacío por defecto si el servicio devuelve vacío', async () => {
    fetchEntitiesMock.mockResolvedValueOnce([]);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEntityQuery(Circuit), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.list).toEqual([]);
  });
});

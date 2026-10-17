import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useEntityCRUD } from './useEntityCRUD';
import { toast } from '../components/tremor/toast/hook/useToast';
import { fetchEntities, saveEntity } from '../services/apiService';
import { Simulator } from '../types/entities';

vi.mock('../services/apiService', () => ({
  fetchEntities: vi.fn(),
  saveEntity: vi.fn(),
}));
vi.mock('../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

const mockFetchEntities = vi.mocked(fetchEntities);
const mockSaveEntity = vi.mocked(saveEntity);
const mockToast = vi.mocked(toast);

const simulator = {
  id: 1,
  name: 'Assetto Corsa',
  status: 'Activo',
} as Simulator;

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderCrud() {
  return renderHook(() => useEntityCRUD(Simulator), { wrapper });
}

describe('useEntityCRUD (BE #56: familia única CRUD admin)', () => {
  beforeEach(() => {
    mockFetchEntities.mockReset();
    mockSaveEntity.mockReset();
    mockToast.mockReset();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('expone la lista que trae la primitiva de query', async () => {
    mockFetchEntities.mockResolvedValue([simulator]);

    const { result } = renderCrud();

    await waitFor(() => expect(result.current.list).toEqual([simulator]));
    expect(result.current.loading).toBe(false);
  });

  it('handleNew crea una instancia vacía y marca isCreating', () => {
    const { result } = renderCrud();

    act(() => result.current.handleNew());

    expect(result.current.editing).toBeInstanceOf(Simulator);
    expect(result.current.editing?.id).toBeUndefined();
    expect(result.current.isCreating).toBe(true);
  });

  it('handleEdit copia la entidad y desmarca isCreating', async () => {
    mockFetchEntities.mockResolvedValue([simulator]);
    const { result } = renderCrud();
    await waitFor(() => expect(result.current.list).toEqual([simulator]));

    act(() => result.current.handleEdit(simulator));

    expect(result.current.isCreating).toBe(false);
    expect(result.current.editing).toEqual(simulator);
    expect(result.current.editing).not.toBe(simulator);
  });

  it('handleCancel limpia editing e isCreating', () => {
    const { result } = renderCrud();

    act(() => result.current.handleNew());
    act(() => result.current.handleCancel());

    expect(result.current.editing).toBeNull();
    expect(result.current.isCreating).toBe(false);
  });

  it('handleSave guarda vía la primitiva y cierra el formulario', async () => {
    mockFetchEntities.mockResolvedValue([]);
    mockSaveEntity.mockResolvedValue(simulator);
    const { result } = renderCrud();
    act(() => result.current.handleEdit(simulator));

    await act(async () => {
      await result.current.handleSave(simulator);
    });

    expect(mockSaveEntity).toHaveBeenCalledWith(Simulator, simulator);
    expect(result.current.editing).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('si guardar falla avisa con toast y deja el formulario abierto', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockFetchEntities.mockResolvedValue([]);
    mockSaveEntity.mockRejectedValue(new Error('boom'));
    const { result } = renderCrud();
    act(() => result.current.handleEdit(simulator));

    await act(async () => {
      await result.current.handleSave(simulator);
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error', title: 'Error al guardar' }),
    );
    expect(result.current.editing).toEqual(simulator);
    consoleError.mockRestore();
  });
});

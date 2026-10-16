import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCombinationForm } from './useCombinationForm';
import { combinationFixture } from '../../../test/fixtures/combinationAdmin';
import { fetchOne } from '../../../services/apiService';

vi.mock('../../../services/apiService.ts', () => ({
  fetchOne: vi.fn(),
}));

const mockFetchOne = vi.mocked(fetchOne);

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCombinationForm (BE #66)', () => {
  afterEach(() => {
    cleanup();
    mockFetchOne.mockReset();
  });

  it('normaliza los ids de versión del objeto inicial', () => {
    const { result } = renderHook(
      () => useCombinationForm({ initial: combinationFixture() }),
      { wrapper },
    );

    expect(result.current.form.categoryVersion).toBe(10);
    expect(result.current.form.circuitVersion).toBe(20);
  });

  it('al cambiar el simulador limpia las versiones seleccionadas', () => {
    const { result } = renderHook(
      () => useCombinationForm({ initial: combinationFixture() }),
      { wrapper },
    );

    act(() => {
      result.current.handleSimulatorChange('2');
    });

    expect(result.current.selectedSimulator).toBe(2);
    expect(result.current.form.categoryVersion).toBeUndefined();
    expect(result.current.form.circuitVersion).toBeUndefined();
  });

  it('handleSelectChange convierte a número salvo para userType', () => {
    const { result } = renderHook(
      () => useCombinationForm({ initial: combinationFixture() }),
      { wrapper },
    );

    act(() => {
      result.current.handleSelectChange('lapsNumber', '25');
    });
    expect(result.current.form.lapsNumber).toBe(25);

    act(() => {
      result.current.handleSelectChange('userType', 'Premium');
    });
    expect(result.current.form.userType).toBe('Premium');
  });

  it('handleInputChange convierte los inputs numéricos a number', () => {
    const { result } = renderHook(
      () => useCombinationForm({ initial: combinationFixture() }),
      { wrapper },
    );

    act(() => {
      result.current.handleInputChange({
        target: { name: 'raceIntervalMinutes', value: '45', type: 'number' },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.form.raceIntervalMinutes).toBe(45);
  });

  it('carga las versiones del simulador elegido', async () => {
    mockFetchOne.mockResolvedValue({
      categories: [{ id: 11, status: 'Activa', category: { denomination: 'TC' } }],
      circuits: [{ id: 21, status: 'Activa', circuit: { denomination: 'Oval' } }],
    } as never);

    const { result } = renderHook(
      () => useCombinationForm({ initial: combinationFixture() }),
      { wrapper },
    );

    act(() => {
      result.current.handleSimulatorChange('2');
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetchOne).toHaveBeenCalled();
    expect(result.current.categoryVersions).toHaveLength(1);
    expect(result.current.circuitVersions).toHaveLength(1);
  });
});

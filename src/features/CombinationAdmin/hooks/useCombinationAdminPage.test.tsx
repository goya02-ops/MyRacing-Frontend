import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';

import { useCombinationAdminPage } from './useCombinationAdminPage';
import { toast } from '../../../components/tremor/toast/hook/useToast';
import { Combination } from '../../../types/entities';

// `vi.hoisted` permite compartir el spy de guardado con la fábrica de mock,
// que Vitest eleva por encima de las declaraciones del archivo.
const mocks = vi.hoisted(() => ({
  genericHandleSave: vi.fn(),
  list: [
    {
      id: 1,
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      categoryVersion: { id: 10 },
      circuitVersion: { id: 20 },
    },
  ],
}));

vi.mock('./useCombinationAdmin', () => ({
  useCombinationAdmin: () => ({
    list: mocks.list,
    editing: null,
    loading: false,
    handleSave: mocks.genericHandleSave,
    handleCancel: vi.fn(),
    handleNew: vi.fn(),
    handleEdit: vi.fn(),
  }),
}));

vi.mock('../../../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

const mockToast = vi.mocked(toast);

describe('useCombinationAdminPage.handleSave (contrato FE-16)', () => {
  beforeEach(() => {
    mocks.genericHandleSave.mockReset();
    mockToast.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('combinación duplicada: avisa con toast warning y no delega el guardado', async () => {
    const duplicated = {
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      categoryVersion: { id: 10 },
      circuitVersion: { id: 20 },
    } as unknown as Combination;

    const { result } = renderHook(() => useCombinationAdminPage());

    await act(async () => {
      await result.current.handleSave(duplicated);
    });

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'warning',
      title: 'Combinación duplicada',
      description: 'Esta combinación ya existe con las mismas fechas.',
    });
    expect(mocks.genericHandleSave).not.toHaveBeenCalled();
  });
});

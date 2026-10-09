import type { Dispatch, SetStateAction } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { handleSaveEntity } from './GlobalHandlers';
import { saveEntity } from '../services/apiService';
import { toast } from '../components/tremor/toast/hook/useToast';
import { Category } from '../types/entities';

// Se mockean las dependencias de efectos externos para aislar el contrato
// de notificación al usuario (FE-16: toast en lugar de alert).
vi.mock('../services/apiService', () => ({
  saveEntity: vi.fn(),
}));

vi.mock('../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

const mockSaveEntity = vi.mocked(saveEntity);
const mockToast = vi.mocked(toast);

function buildSetter(): Dispatch<SetStateAction<Category[]>> {
  return vi.fn() as unknown as Dispatch<SetStateAction<Category[]>>;
}

describe('handleSaveEntity (contrato FE-16: toast en lugar de alert)', () => {
  beforeEach(() => {
    mockSaveEntity.mockReset();
    mockToast.mockReset();
    // La implementación actual usa alert(); se silencia para que el rojo del
    // test sea por el toast ausente y no por el diálogo nativo (happy-dom no
    // define window.alert, por eso se stubea el global).
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('duplicado: avisa con toast warning y no intenta persistir', async () => {
    const setter = buildSetter();
    const onSuccess = vi.fn();
    const duplicateCheck = vi.fn().mockReturnValue(true);

    await handleSaveEntity(
      Category,
      { denomination: 'GT3' } as Category,
      setter,
      onSuccess,
      duplicateCheck
    );

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'warning',
      title: 'Elemento duplicado',
      description: 'Ya existe ese elemento en la lista.',
    });
    expect(mockSaveEntity).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('error al guardar: avisa con toast error con el mensaje del Error', async () => {
    mockSaveEntity.mockRejectedValue(new Error('boom'));

    await handleSaveEntity(
      Category,
      { denomination: 'GT3' } as Category,
      buildSetter(),
      vi.fn()
    );

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'error',
      title: 'Error al guardar',
      description: 'boom',
    });
  });

  it('éxito: persiste e invoca setter y onSuccess (caracterización)', async () => {
    const saved = { id: 3, denomination: 'GT3' } as Category;
    mockSaveEntity.mockResolvedValue(saved);
    const setter = buildSetter();
    const onSuccess = vi.fn();

    await handleSaveEntity(
      Category,
      { denomination: 'GT3' } as Category,
      setter,
      onSuccess
    );

    expect(mockSaveEntity).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});

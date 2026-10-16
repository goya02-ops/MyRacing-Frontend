import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useRaceInscription } from './useRaceInscription';
import { registerUserToRace } from '../../../services/raceService';
import { toast } from '../../../components/tremor/toast/hook/useToast';
import { ApiError } from '../../../services/apiError.ts';
import { User, Race, RaceUser } from '../../../types/entities';

// Se aísla la red y el sistema de notificación para fijar el contrato de toast.
vi.mock('../../../services/raceService', () => ({
  registerUserToRace: vi.fn(),
}));

vi.mock('../../../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

const mockRegister = vi.mocked(registerUserToRace);
const mockToast = vi.mocked(toast);

const user = { id: 1, userName: 'piloto' } as User;
const race = { id: 2, combination: { id: 3 } } as Race;

// Un QueryClient nuevo por test evita que el estado cacheado entre casos
// acelere/ensucie el transcurso de loading -> success.
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useRaceInscription (contrato: toast en lugar de alert)', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockToast.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('si registerUserToRace rechaza, avisa con toast de error', async () => {
    mockRegister.mockRejectedValue(new Error('Error al inscribirse'));

    const { result } = renderHook(() => useRaceInscription(user, race), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleInscription();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error al inscribirse',
        description: 'No se pudo inscribir, intente nuevamente.',
      });
    });
  });

  it('mapea la causa por status: 409 -> ya inscripto', async () => {
    mockRegister.mockRejectedValue(
      new ApiError(409, 'User already registered for this race'),
    );

    const { result } = renderHook(() => useRaceInscription(user, race), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleInscription();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error al inscribirse',
        description: 'Ya estás inscripto en esta carrera.',
      });
    });
  });

  it('mapea la causa por status: 401 -> sesión expirada', async () => {
    mockRegister.mockRejectedValue(new ApiError(401, 'Usuario no autenticado'));

    const { result } = renderHook(() => useRaceInscription(user, race), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleInscription();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error al inscribirse',
        description: 'Tu sesión expiró. Iniciá sesión nuevamente.',
      });
    });
  });

  it('éxito: handleInscription existe y success transita a true (caracterización)', async () => {
    mockRegister.mockResolvedValue({ id: 9 } as RaceUser);

    const { result } = renderHook(() => useRaceInscription(user, race), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.handleInscription).toBe('function');
    expect(result.current.success).toBe(false);

    act(() => {
      result.current.handleInscription();
    });

    await waitFor(() => {
      expect(result.current.success).toBe(true);
    });
  });
});

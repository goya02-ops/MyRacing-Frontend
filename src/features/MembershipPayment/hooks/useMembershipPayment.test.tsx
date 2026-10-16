import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useMembershipPage } from './useMembershipPayment';
import { toast } from '../../../components/tremor/toast/hook/useToast';

// Se aísla la red, el usuario y el sistema de notificación para fijar el
// contrato: un pago fallido debe avisar con toast de error.
vi.mock('../../../services/membershipService', () => ({
  fetchCurrentMembership: vi.fn().mockResolvedValue({ price: 1500 }),
  createPaymentPreference: vi.fn(),
  processPayment: vi.fn(),
}));

vi.mock('../../../context/UserContext.tsx', () => ({
  useUser: () => ({
    user: { userName: 'piloto', type: 'common' },
    setUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

import { processPayment } from '../../../services/membershipService';

const mockProcessPayment = vi.mocked(processPayment);
const mockToast = vi.mocked(toast);

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

describe('useMembershipPage processPayment (contrato: fallo visible con toast)', () => {
  beforeEach(() => {
    mockProcessPayment.mockReset();
    mockToast.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('si processPayment rechaza, avisa con toast de error', async () => {
    mockProcessPayment.mockRejectedValue(new Error('Tarjeta rechazada'));

    const { result } = renderHook(() => useMembershipPage(), {
      wrapper: createWrapper(),
    });

    let failure: unknown = null;
    await act(async () => {
      try {
        await result.current.processPaymentAsync({ membershipId: 1 });
      } catch (error) {
        failure = error;
      }
    });

    expect(failure).toBeInstanceOf(Error);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error en el pago',
        description: 'Tarjeta rechazada',
      });
    });
  });
});

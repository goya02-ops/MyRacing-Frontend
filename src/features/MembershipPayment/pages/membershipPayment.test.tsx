import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { toast } from '../../../components/tremor/toast/hook/useToast';

// Estado de la página bajo control: con preferencia creada para que monte
// el Brick de pago.
const pageState = vi.hoisted(() => ({
  user: { realName: 'Piloto', userName: 'piloto', type: 'common' },
  membership: { price: 1500, dateFrom: '2026-01-01' },
  isLoading: false,
  isError: false,
  isPremium: false,
  isAdmin: false,
  preferenceId: 'pref-1' as string | null,
  isCreatingPreference: false,
  handleCreatePreference: vi.fn(),
  processPaymentAsync: vi.fn(),
}));

vi.mock('../hooks/useMembershipPayment.ts', () => ({
  useMembershipPage: () => ({ ...pageState }),
}));

// Brick bajo control: captura las props para disparar onError a mano.
const brickProps = vi.hoisted(() => ({
  current: null as null | { onError?: (error: unknown) => void },
}));

vi.mock('@mercadopago/sdk-react', () => ({
  initMercadoPago: vi.fn(),
  Payment: (props: { onError?: (error: unknown) => void }) => {
    brickProps.current = props;
    return <div data-testid="payment-brick" />;
  },
}));

vi.mock('../../../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

const mockToast = vi.mocked(toast);

describe('MembershipPage Brick (contrato: fallo visible, no silencioso)', () => {
  beforeEach(async () => {
    mockToast.mockReset();
    brickProps.current = null;
    // La página exige PUBLIC KEY para renderizar el contenido: se fija
    // antes del import dinámico porque se lee a nivel de módulo.
    vi.stubEnv('VITE_MP_PUBLIC_KEY', 'test-key');
    const { default: MembershipPage } = await import('./membershipPayment');
    render(
      <MemoryRouter>
        <MembershipPage />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('si el Brick de pago reporta un error, avisa con toast de error', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('payment-brick')).toBeInTheDocument();
    });

    await act(async () => {
      brickProps.current?.onError?.(new Error('Brick caído'));
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error en el medio de pago',
        description: 'Brick caído',
      });
    });
  });
});

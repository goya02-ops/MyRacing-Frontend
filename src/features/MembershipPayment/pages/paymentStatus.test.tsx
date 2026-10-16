import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { toast } from '../../../components/tremor/toast/hook/useToast';

// Hook bajo control: cada test define qué estado de pago ve la página.
const paymentState = vi.hoisted(() => ({
  paymentId: 'pay-123' as string | null,
  isChecking: false,
  status: undefined as string | undefined,
  message: undefined as string | undefined,
  isError: false,
  error: null as string | null,
}));

vi.mock('../hooks/usePaymentStatus.ts', () => ({
  usePaymentStatus: () => ({ ...paymentState }),
}));

// Brick bajo control: captura las props para disparar onError a mano.
const brickProps = vi.hoisted(() => ({
  current: null as null | { onError?: (error: unknown) => void },
}));

vi.mock('@mercadopago/sdk-react', () => ({
  initMercadoPago: vi.fn(),
  StatusScreen: (props: { onError?: (error: unknown) => void }) => {
    brickProps.current = props;
    return <div data-testid="status-brick" />;
  },
}));

vi.mock('../../../components/tremor/toast/hook/useToast', () => ({
  toast: vi.fn(),
}));

import PaymentStatusPage from './paymentStatus';

const mockToast = vi.mocked(toast);

function renderPage() {
  render(
    <MemoryRouter>
      <PaymentStatusPage />
    </MemoryRouter>
  );
}

describe('PaymentStatusPage (contrato: fallo visible, no silencioso)', () => {
  beforeEach(() => {
    mockToast.mockReset();
    brickProps.current = null;
    paymentState.paymentId = 'pay-123';
    paymentState.isChecking = false;
    paymentState.isError = false;
    paymentState.error = null;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('si la verificación falla, muestra la rama de error en lugar del Brick', async () => {
    paymentState.isError = true;
    paymentState.error = 'No se pudo verificar el pago';

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo verificar el pago')
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId('status-brick')).not.toBeInTheDocument();
  });

  it('si el Status Brick reporta un error, avisa con toast de error', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('status-brick')).toBeInTheDocument();
    });

    await act(async () => {
      brickProps.current?.onError?.(new Error('Brick caído'));
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Error al mostrar el estado del pago',
        description: 'Brick caído',
      });
    });
  });
});

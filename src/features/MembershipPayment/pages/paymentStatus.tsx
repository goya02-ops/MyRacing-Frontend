import { useMemo, useCallback } from 'react';
import type { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusScreen, initMercadoPago } from '@mercadopago/sdk-react';
import {
  Card,
  Button,
  Callout,
} from '../../../components/tremor/TremorComponents.tsx';
import Spinner from '../../../components/Spinner.tsx';
import { RiAlertFill } from '@remixicon/react';
import { usePaymentStatus } from '../hooks/usePaymentStatus.ts';
import { toast } from '../../../components/tremor/toast/hook/useToast';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
}

type StatusBrickOnError = NonNullable<
  ComponentProps<typeof StatusScreen>['onError']
>;

export default function PaymentStatusPage() {
  const navigate = useNavigate();
  const { paymentId, isChecking, isError, error } = usePaymentStatus();

  const handleReturn = () => {
    navigate('/my-profile');
  };

  const initialization = useMemo(() => {
    return { paymentId: paymentId! };
  }, [paymentId]);

  const onError: StatusBrickOnError = useCallback((error) => {
    toast({
      variant: 'error',
      title: 'Error al mostrar el estado del pago',
      description: error instanceof Error ? error.message : String(error),
    });
  }, []);

  const onReady = useCallback(() => {
    console.log('Status Brick listo');
  }, []);

  return (
    <div className="mx-auto max-w-lg mt-10 p-4">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Estado de la Operación
      </h1>

      <Card className="text-gray-200 bg-white dark:bg-[#090E1A] p-0 overflow-hidden border border-gray-800">
        {isChecking && (
          <div className="p-12 text-center">
            <Spinner>Verificando transacción...</Spinner>
          </div>
        )}

        {!isChecking && !paymentId && (
          <div className="p-8 text-center">
            <p className="text-red-400 font-medium">
              No se encontró información del pago.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirigiendo a tu perfil...
            </p>
          </div>
        )}

        {!isChecking && isError && (
          <div className="p-8">
            <Callout
              title="Error al verificar el pago"
              icon={RiAlertFill}
              variant="error"
            >
              {error ?? 'No se pudo verificar el estado del pago.'}
            </Callout>
          </div>
        )}

        {!isChecking && !isError && paymentId && (
          <div id="status_brick_container" className="p-4">
            <StatusScreen
              initialization={initialization}
              onReady={onReady}
              onError={onError}
            />
          </div>
        )}

        <div className="p-4 border-t border-gray-800/50 bg-gray-900/30">
          <Button onClick={handleReturn} className="w-full" variant="secondary">
            Volver a Mi Perfil
          </Button>
        </div>
      </Card>
    </div>
  );
}

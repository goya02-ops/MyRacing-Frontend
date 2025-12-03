import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusScreen, initMercadoPago } from '@mercadopago/sdk-react';
import { Card, Button } from '../../../components/tremor/TremorComponents.tsx';
import Spinner from '../../../components/Spinner.tsx';
import { usePaymentStatus } from '../hooks/usePaymentStatus.ts';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
}

export default function PaymentStatusPage() {
  const navigate = useNavigate();
  const { paymentId, isChecking } = usePaymentStatus();

  const handleReturn = () => {
    navigate('/my-profile');
  };

  const initialization = useMemo(() => {
    return { paymentId: paymentId! };
  }, [paymentId]);

  const onError = useCallback((error: any) => {
    console.error('Error en Status Brick:', error);
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

        {!isChecking && paymentId && (
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

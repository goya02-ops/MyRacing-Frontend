import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import type { ComponentProps } from 'react';
import {
  Card,
  Button,
  Badge,
  Divider,
  Callout,
} from '../../../components/tremor/TremorComponents.tsx';
import Spinner from '../../../components/Spinner.tsx';
import { useMembershipPage } from '../hooks/useMembershipPayment.ts';
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCopperCoinFill,
} from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import type { PaymentFormData } from '../../../services/membershipService.ts';

type PaymentBrickOnSubmit = ComponentProps<typeof Payment>['onSubmit'];
type PaymentBrickOnError = NonNullable<
  ComponentProps<typeof Payment>['onError']
>;

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, {
    locale: 'es-AR',
  });
} else {
  console.error('VITE_MP_PUBLIC_KEY no está definida en .env.local');
}

export default function MembershipPage() {
  const navigate = useNavigate();
  const {
    user,
    membership,
    isLoading,
    isError,
    isPremium,
    isAdmin,
    preferenceId,
    isCreatingPreference,
    handleCreatePreference,
    processPaymentAsync,
  } = useMembershipPage();

  const onSubmit: PaymentBrickOnSubmit = async ({
    selectedPaymentMethod,
    formData,
  }) => {
    if (!formData) {
      console.log(
        `Pago delegado al Webhook. Método: ${selectedPaymentMethod || 'N/A'}.`
      );

      navigate('/payment-status');

      return;
    }

    try {
      const result = await processPaymentAsync(
        formData as unknown as PaymentFormData
      );
      navigate(`/payment-status?payment_id=${encodeURIComponent(result.paymentId)}`);
      return;
    } catch (error) {
      console.error('Error en el pago:', error);
      throw error;
    }
  };

  const onError: PaymentBrickOnError = async (error) => {
    console.error('Error en Brick MP:', error);
  };

  const onReady = async () => {
    // Brick cargado
  };
  const renderContent = () => {
    if (!MP_PUBLIC_KEY) {
      return (
        <Callout
          title="Error de Configuración"
          icon={RiAlertFill}
          variant="error"
          className="mt-4"
        >
          La integración con Mercado Pago no está configurada (falta PUBLIC
          KEY).
        </Callout>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner>Cargando membresía...</Spinner>
        </div>
      );
    }

    if (isError || !membership) {
      return (
        <Callout
          title="Error"
          icon={RiAlertFill}
          variant="error"
          className="mt-4"
        >
          No se pudo cargar el precio de la membresía. Por favor, intente más
          tarde.
        </Callout>
      );
    }

    if (isPremium) {
      return (
        <Callout
          title="¡Ya sos Premium!"
          icon={RiCheckboxCircleFill}
          variant="success"
          className="mt-4 text-center"
        >
          Tu cuenta ya goza de todos los beneficios. No necesitas realizar
          ningún pago.
        </Callout>
      );
    }

    if (isAdmin) {
      return (
        <Callout
          title="¡El administrador no tiene que pagar membresía!"
          icon={RiCheckboxCircleFill}
          variant="warning"
          className="mt-4 text-center"
        />
      );
    }

    return (
      <>
        <div className="text-center">
          <p className="text-sm text-gray-400">Precio actual</p>
          <p className="text-6xl font-bold text-orange-400 my-2">
            ${membership.price}
          </p>
          <p className="text-sm text-gray-500">
            Pago único para acceso Premium (Vigente desde:{' '}
            {new Date(membership.dateFrom).toLocaleDateString('es-AR')})
          </p>
        </div>
        <Divider />
        <p className="text-gray-300">
          Al hacerte Premium, tendrás acceso a carreras y torneos exclusivos que
          están marcados en la plataforma.
        </p>

        {!preferenceId ? (
          <Button
            onClick={() => handleCreatePreference()}
            className="w-full mt-6"
            isLoading={isCreatingPreference}
            disabled={isCreatingPreference}
          >
            {isCreatingPreference ? (
              'Generando link de pago...'
            ) : (
              <>
                <RiCopperCoinFill />
                Pagar y convertirme en Premium
              </>
            )}
          </Button>
        ) : (
          <div
            className="mt-6 w-full flex justify-center"
            id="wallet_container"
          >
            <Payment
              initialization={{
                preferenceId: preferenceId,
                amount: membership.price,
              }}
              customization={{
                visual: {
                  style: {
                    theme: 'default',
                  },
                },
                paymentMethods: {
                  ticket: 'all',
                  creditCard: 'all',
                  prepaidCard: 'all',
                  debitCard: 'all',
                  mercadoPago: 'all',
                },
              }}
              onSubmit={onSubmit}
              onError={onError}
              onReady={onReady}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Membresía Premium</h1>
      <Card className="text-gray-200">
        <h3 className="text-lg font-semibold mb-2">
          ¡Hola, {user?.realName || user?.userName}!
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-gray-400">Tu estado actual es:</p>
          <Badge
            variant={isPremium ? 'success' : 'neutral'}
            className="text-base"
          >
            {user?.type.toUpperCase()}
          </Badge>
        </div>

        {renderContent()}
      </Card>
    </div>
  );
}

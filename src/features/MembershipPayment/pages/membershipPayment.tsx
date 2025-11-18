import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
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

const MP_PUBLIC_KEY = 'TEST-3a5b26c4-1de7-4241-ac99-db18c349a54e';
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, {
    locale: 'es-AR',
  });
} else {
  console.error('VITE_MP_PUBLIC_KEY no está definida en .env.local');
}

export default function MembershipPage() {
  const {
    user,
    membership,
    isLoading,
    isError,
    isPremium,
    preferenceId,
    isCreatingPreference,
    handleCreatePreference,
  } = useMembershipPage();

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
          title="¡Ya eres Premium!"
          icon={RiCheckboxCircleFill}
          variant="success"
          className="mt-4 text-center"
        >
          Tu cuenta ya goza de todos los beneficios. No necesitas realizar
          ningún pago.
        </Callout>
      );
    }

    // Si es usuario "common" y la membresía cargó OK
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
                'Pagar y convertirme en Premium'
              </>
            )}
          </Button>
        ) : (
          <div
            className="mt-6 w-full flex justify-center"
            id="wallet_container"
          >
            <Wallet
              initialization={{ preferenceId: preferenceId }}
              customization={{
                texts: {
                  action: 'Pagar',
                  valueProp: 'Pagar ahora',
                },
                visual: {
                  buttonBackground: 'brand',
                  borderRadius: '6px',
                },
              }}
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

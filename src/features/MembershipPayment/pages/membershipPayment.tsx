import { initMercadoPago, CardPayment, Wallet } from '@mercadopago/sdk-react';
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
  RiBankCardFill,
  RiWallet3Fill,
  RiShieldCheckFill,
} from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
}

export default function MembershipPage() {
  const navigate = useNavigate();
  // Estado para el overlay de carga
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  const onCardSubmit = async (formData: any) => {
    setIsRedirecting(true);
    try {
      const paymentData = { ...formData, preference_id: preferenceId };
      const result = await processPaymentAsync(paymentData);

      if (result.paymentId) {
        navigate(
          `/payment-status?payment_id=${result.paymentId}&collection_status=${result.status}`
        );
      } else {
        navigate('/my-profile');
      }
    } catch (error: any) {
      console.error('Error procesando tarjeta:', error);
      setIsRedirecting(false);
      if (error.paymentId) {
        navigate(
          `/payment-status?payment_id=${error.paymentId}&collection_status=${error.status}`
        );
      }
    }
  };

  const initializationWallet = {
    preferenceId: preferenceId!,
    redirectMode: 'self' as const,
  };

  const onWalletSubmit = async () => {
    setIsRedirecting(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  };

  const onError = (error: any) => {
    console.error('Error en Brick:', error);
    setIsRedirecting(false);
  };

  const renderContent = () => {
    if (!MP_PUBLIC_KEY)
      return (
        <Callout title="Error" icon={RiAlertFill} variant="error">
          Falta MP Public Key
        </Callout>
      );

    if (isLoading)
      return (
        <div className="flex justify-center py-10">
          <Spinner>Cargando información...</Spinner>
        </div>
      );

    if (isError || !membership)
      return (
        <Callout title="Error" icon={RiAlertFill} variant="error">
          No se pudo cargar el precio.
        </Callout>
      );

    if (isPremium)
      return (
        <Callout
          title="¡Ya eres Premium!"
          icon={RiCheckboxCircleFill}
          variant="success"
          className="mt-4 text-center"
        >
          Disfruta tu acceso total.
        </Callout>
      );

    if (isAdmin)
      return (
        <Callout
          title="Admin"
          icon={RiCheckboxCircleFill}
          variant="warning"
          className="mt-4 text-center"
        >
          Acceso total gratuito.
        </Callout>
      );

    return (
      <div className="relative">
        {isRedirecting && (
          <div className="absolute inset-0 z-50 bg-[#090E1A]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-fadeIn">
            <Spinner />
            <h3 className="text-xl font-bold text-white mt-6">Procesando...</h3>
            <p className="text-gray-400 mt-2 px-4 text-center">
              Estamos conectando con Mercado Pago. <br />
              No cierres esta pestaña.
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Desbloquea tu Potencial
          </h2>
          <p className="text-gray-400">
            Accede a las ligas profesionales y compite al máximo nivel.
          </p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-xl border border-orange-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <RiShieldCheckFill className="w-24 h-24 text-orange-500" />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            Pago Único
          </p>
          <div className="flex justify-center items-baseline gap-1 my-2">
            <span className="text-5xl font-extrabold text-orange-400">
              ${membership.price}
            </span>
            <span className="text-gray-500">ARS</span>
          </div>
          <p className="text-sm text-gray-400">Acceso Premium de por vida</p>
        </div>

        <div className="mt-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <RiCheckboxCircleFill className="text-orange-500 w-5 h-5" />
            Beneficios Exclusivos:
          </h3>
          <ul className="space-y-3 text-gray-300 ml-1">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              <span>
                Inscripción a torneos y ligas <strong>profesionales</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              <span>
                Acceso a carreras con <strong>cupos limitados</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              <span>
                Estadísticas avanzadas y <strong>telemetría</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              <span>
                Prioridad en asignación de <strong>skins y números</strong>.
              </span>
            </li>
          </ul>
        </div>

        <Divider />

        {!preferenceId ? (
          <Button
            onClick={() => handleCreatePreference()}
            className="w-full mt-4 h-14 text-lg shadow-lg shadow-orange-500/20"
            isLoading={isCreatingPreference}
            disabled={isCreatingPreference}
            variant="primary"
          >
            {isCreatingPreference ? (
              'Preparando pasarela...'
            ) : (
              <>
                <RiCopperCoinFill className="mr-2" /> Pagar y ser Premium
              </>
            )}
          </Button>
        ) : (
          <div className="mt-8 animate-fadeIn">
            <h3 className="text-center text-gray-400 mb-6 text-xs font-bold uppercase tracking-widest">
              Selecciona tu método de pago
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="bg-white rounded-lg p-1 shadow-md flex flex-col">
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center gap-2 mb-1">
                  <RiBankCardFill className="text-gray-600 w-5 h-5" />
                  <span className="text-gray-700 font-semibold text-sm">
                    Tarjeta de Crédito/Débito
                  </span>
                </div>
                <div className="flex-1">
                  <CardPayment
                    initialization={{ amount: membership.price }}
                    customization={{
                      visual: { style: { theme: 'default' } },
                      paymentMethods: { maxInstallments: 1 },
                    }}
                    onSubmit={onCardSubmit}
                    onError={onError}
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="lg:hidden flex items-center gap-4 my-4">
                  <div className="h-px bg-gray-700 flex-1"></div>
                  <span className="text-gray-500 text-xs">O</span>
                  <div className="h-px bg-gray-700 flex-1"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center bg-[#1A202C] rounded-lg p-6 border border-gray-700 shadow-inner h-full">
                  <div className="text-center mb-6">
                    <RiWallet3Fill className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h4 className="text-white font-medium">
                      Billetera Mercado Pago
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 px-4">
                      Usa tu dinero en cuenta o tarjetas guardadas sin salir.
                    </p>
                  </div>

                  <div id="wallet_container" className="w-full">
                    <Wallet
                      initialization={initializationWallet}
                      customization={{
                        theme: 'default',
                        customStyle: {
                          valuePropColor: 'white',
                        },
                      }}
                      onSubmit={onWalletSubmit}
                      onError={onError}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Membresía Premium
      </h1>
      <Card className="text-gray-200 bg-[#090E1A] border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Hola, {user?.realName}</h3>
          <Badge variant={isPremium ? 'success' : 'neutral'}>
            {user?.type.toUpperCase()}
          </Badge>
        </div>
        {renderContent()}
      </Card>
    </div>
  );
}

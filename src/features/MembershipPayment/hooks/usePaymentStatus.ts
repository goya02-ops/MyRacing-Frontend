import { useEffect } from 'react';
import { useUser } from '../../../context/UserContext.tsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkPaymentStatus as checkPaymentStatusManual } from '../../../services/membershipService.ts';

export function usePaymentStatus() {
  const { setUser } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get('payment_id');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['paymentStatus', paymentId],
    queryFn: () => checkPaymentStatusManual(paymentId!),
    enabled: !!paymentId, // Solo se ejecuta si existe un ID
    retry: 2, // en caso de fallo, reintenta 2 veces
    staleTime: 0, // Siempre queremos el dato fresco del backend
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.status === 'approved' && data?.user) {
      setUser(data.user);
      console.log(
        '✅ Usuario actualizado a Premium exitosamente (React Query).'
      );
    }
  }, [data, setUser]);

  useEffect(() => {
    if (!paymentId) {
      const timer = setTimeout(() => {
        console.warn('No se encontró payment_id. Redirigiendo...');
        navigate('/my-profile');
      }, 5000); // 5 segundos para que el usuario lea el mensaje de error
      return () => clearTimeout(timer);
    }
  }, [paymentId, navigate]);

  return {
    paymentId,
    isChecking: isLoading,
    status: data?.status,
    message: data?.message,
    isError,
    error: error ? (error as Error).message : null,
  };
}

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext.tsx';
import {
  fetchCurrentMembership,
  createPaymentPreference,
} from '../../../services/membershipService.ts';

export function useMembershipPage() {
  const { user } = useUser();

  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const {
    data: membership,
    isLoading: isLoadingPrice,
    isError,
  } = useQuery({
    queryKey: ['currentMembership'],
    queryFn: fetchCurrentMembership,
    staleTime: 1000 * 60 * 15, // 15 minutos de caché
  });

  const { mutate: createPreference, isPending: isCreatingPreference } =
    useMutation({
      mutationFn: createPaymentPreference,
      onSuccess: (data) => {
        setPreferenceId(data.preferenceId);
      },
      onError: (err) => {
        console.error('Error al crear preferencia:', err);
        alert(`Error al iniciar el pago: ${err.message}`);
      },
    });

  const isPremium = user?.type === 'premium' || user?.type === 'admin';

  return {
    user,
    membership,
    isLoading: isLoadingPrice,
    isError,
    isPremium,

    preferenceId,
    isCreatingPreference,
    handleCreatePreference: createPreference,
  };
}

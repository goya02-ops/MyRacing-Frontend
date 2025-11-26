import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext.tsx';
import {
  fetchCurrentMembership,
  createPaymentPreference,
  processPayment,
} from '../../../services/membershipService.ts';

export function useMembershipPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
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

  const processPaymentMutation = useMutation({
    mutationFn: processPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentMembership'] });
    },
  });

  const isPremium = user?.type === 'premium';
  const isAdmin = user?.type === 'admin';

  return {
    user,
    membership,
    isLoading: isLoadingPrice,
    isError,
    isPremium,
    isAdmin,
    preferenceId,
    isCreatingPreference,
    handleCreatePreference: createPreference,
    processPaymentAsync: processPaymentMutation.mutateAsync,
    isProcessingPayment: processPaymentMutation.isPending,
  };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserToRace } from '../../../services/raceService.ts';
import { User, Race } from '../../../types/entities';
import { createRacesForCombinationKey } from '../../../utils/queryKeys';

export function useRaceInscription(user: User, race: Race) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => registerUserToRace(user.id!, race.id!),

    onSuccess: () => {
      if (race.combination?.id) {
        queryClient.invalidateQueries({
          queryKey: createRacesForCombinationKey(race.combination.id),
        });
      }
    },

    onError: (err) => {
      console.error('Error al inscribirse:', err);
      alert('No se pudo inscribir, intente nuevamente');
    },
  });

  return {
    loading: mutation.isPending,
    success: mutation.isSuccess,
    handleInscription: mutation.mutate,
  };
}

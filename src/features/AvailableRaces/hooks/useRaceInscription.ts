import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserToRace } from '../../../services/raceService.ts';
import { User, Race } from '../../../types/entities';
import { createRacesForCombinationKey } from '../../../utils/queryKeys';

export function useRaceInscription(user: User | null, race: Race | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!user || !race) throw new Error('Usuario o carrera no definidos');
      return registerUserToRace(user.id!, race.id!);
    },

    onSuccess: () => {
      const combinationId = race?.combination?.id;
      if (combinationId) {
        queryClient.invalidateQueries({
          queryKey: createRacesForCombinationKey(combinationId),
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

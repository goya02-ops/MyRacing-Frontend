import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserToRace } from '../../../services/raceService.ts';
import { User, Race } from '../../../types/entities';
import { createRacesForCombinationKey } from '../../../utils/queryKeys';
import { toast } from '../../../components/tremor/toast/hook/useToast';

// Acepta user/race nulos para poder invocarse siempre (Rules of Hooks); el
// mutate queda inerte mientras falten los ids.
export function useRaceInscription(user: User | null, race: Race | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!user?.id || !race?.id) {
        throw new Error('Inscripción no disponible');
      }
      return registerUserToRace(user.id, race.id);
    },

    onSuccess: () => {
      if (race?.combination?.id) {
        queryClient.invalidateQueries({
          queryKey: createRacesForCombinationKey(race.combination.id),
        });
      }
    },

    onError: (err) => {
      console.error('Error al inscribirse:', err);
      toast({
        variant: 'error',
        title: 'Error al inscribirse',
        description: 'No se pudo inscribir, intente nuevamente.',
      });
    },
  });

  return {
    loading: mutation.isPending,
    success: mutation.isSuccess,
    handleInscription: mutation.mutate,
  };
}

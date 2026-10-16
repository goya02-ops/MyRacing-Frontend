import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserToRace } from '../../../services/raceService.ts';
import { User, Race } from '../../../types/entities';
import { createRacesForCombinationKey } from '../../../utils/queryKeys';
import { toast } from '../../../components/tremor/toast/hook/useToast';
import { errorStatus } from '../../../services/apiError.ts';

// Traduce la causa del error (status HTTP) a un mensaje útil, en vez de mostrar
// el mismo texto genérico para 401/404/409/500.
function inscriptionErrorMessage(error: unknown): string {
  switch (errorStatus(error)) {
    case 401:
      return 'Tu sesión expiró. Iniciá sesión nuevamente.';
    case 404:
      return 'La carrera ya no está disponible.';
    case 409:
      return 'Ya estás inscripto en esta carrera.';
    default:
      return 'No se pudo inscribir, intente nuevamente.';
  }
}

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
        description: inscriptionErrorMessage(err),
      });
    },
  });

  return {
    loading: mutation.isPending,
    success: mutation.isSuccess,
    handleInscription: mutation.mutate,
  };
}

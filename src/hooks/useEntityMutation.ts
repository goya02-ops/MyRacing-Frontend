import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEntity } from '../services/apiService';
import type { Constructor } from '../types/entityMeta';

export function useEntityMutation<T extends { id?: number }>(
  cls: Constructor<T>
) {
  const queryClient = useQueryClient();
  const queryKey = [cls.name];

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: (entity: T) => saveEntity(cls, entity),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
    // Aquí también puedes manejar onError
  });

  return { saveEntity: mutateAsync, isSaving };
}

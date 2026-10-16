import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEntity } from '../services/apiService';
import { createEntityKey } from '../utils/queryKeys';
import type { Constructor } from '../types/entityMeta';

export function useEntityMutation<T extends { id?: number }>(
  cls: Constructor<T>
) {
  const queryClient = useQueryClient();
  const queryKey = createEntityKey(cls);

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: (entity: T) => saveEntity(cls, entity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return { saveEntity: mutateAsync, isSaving };
}
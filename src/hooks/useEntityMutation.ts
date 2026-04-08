import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEntity } from '../services/apiService';
import { normalizeRelations } from '../utils/normalizeEntity.ts';
import type { Constructor } from '../types/entityMeta';

export function useEntityMutation<T extends { id?: number }>(
  cls: Constructor<T>
) {
  const queryClient = useQueryClient();
  const queryKey = [cls.name];

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: (entity: T) => {
      const normalizedEntity = normalizeRelations(entity);
      return saveEntity(cls, normalizedEntity);
    },
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return { saveEntity: mutateAsync, isSaving };
}
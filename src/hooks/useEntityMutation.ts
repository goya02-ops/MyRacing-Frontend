import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEntity } from '../services/apiService';
import type { Constructor } from '../types/entityMeta';

function flattenRelations<T>(entity: T): T {
  const entityToSave: any = { ...entity };
  for (const key in entityToSave) {
    const value = entityToSave[key];
    if (typeof value === 'object' && value !== null && 'id' in value) {
      entityToSave[key] = (value as any).id;
    }
  }
  return entityToSave as T;
}

export function useEntityMutation<T extends { id?: number }>(
  cls: Constructor<T>
) {
  const queryClient = useQueryClient();
  const queryKey = [cls.name];

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: (entity: T) => {
      // Aplanamos la entidad ANTES de mandarla al apiService
      const flatEntity = flattenRelations(entity);
      return saveEntity(cls, flatEntity);
    },
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return { saveEntity: mutateAsync, isSaving };
}
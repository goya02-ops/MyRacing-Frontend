import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEntity, deleteEntity } from '../services/apiService';
import type { Constructor } from '../types/entityMeta';

export function useEntityMutation<T extends { id?: number }>(
  cls: Constructor<T>
) {
  const queryClient = useQueryClient();
  const queryKey = [cls.name];

  const { mutateAsync: saveMutate, isPending: isSaving } = useMutation({
    mutationFn: (entity: T) => saveEntity(cls, entity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const { mutateAsync: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteEntity(cls, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return {
    saveEntity: saveMutate,
    isSaving,
    deleteEntity: deleteMutate,
    isDeleting,
  };
}
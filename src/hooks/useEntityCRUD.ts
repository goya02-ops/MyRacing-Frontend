import { useCallback, useState } from 'react';
import { useEntityQuery } from './useEntityQuery';
import { useEntityMutation } from './useEntityMutation';
import type { Constructor } from '../types/entityMeta';
import { toast } from '../components/tremor/toast/hook/useToast';

/**
 * Estado de la máquina de edición de una entidad admin.
 * Los componentes consumen estos handlers; no reimplementen
 * handleNew/handleEdit/handleCancel/handleSave en cada feature.
 */
export interface EntityCRUD<T> {
  list: T[];
  loading: boolean;
  editing: T | null;
  isCreating: boolean;
  isSaving: boolean;
  handleNew: () => void;
  handleEdit: (entity: T) => void;
  handleCancel: () => void;
  handleSave: (entity: T) => Promise<void>;
}

/**
 * Familia de hooks CRUD admin, en dos capas:
 * - `useEntityQuery` / `useEntityMutation`: primitivas de datos
 *   (traer la lista, guardar e invalidar la caché).
 * - `useEntityCRUD`: compone las primitivas y agrega la máquina de
 *   edición (editing / isCreating / new / edit / cancel / save con toast).
 */
export function useEntityCRUD<T extends { id?: number }>(
  cls: Constructor<T>,
): EntityCRUD<T> {
  const { list, isLoading: loading } = useEntityQuery<T>(cls);
  const { saveEntity: mutateSave, isSaving } = useEntityMutation<T>(cls);

  const [editing, setEditing] = useState<T | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  const handleSave = useCallback(
    async (entity: T) => {
      try {
        await mutateSave(entity);
        handleCancel();
      } catch (error) {
        console.error(`Error guardando ${cls.name}:`, error);
        toast({
          variant: 'error',
          title: 'Error al guardar',
          description: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [cls, mutateSave, handleCancel],
  );

  const handleNew = useCallback(() => {
    setEditing(new cls());
    setIsCreating(true);
  }, [cls]);

  const handleEdit = useCallback((entity: T) => {
    setEditing({ ...entity });
    setIsCreating(false);
  }, []);

  return {
    list,
    loading,
    editing,
    isCreating,
    isSaving,
    handleNew,
    handleEdit,
    handleCancel,
    handleSave,
  };
}

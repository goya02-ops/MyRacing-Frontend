import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntities, saveEntity } from '../services/apiService';
import type { Constructor } from '../types/entityMeta';

interface AdminCRUDLogic<T> {
  list: T[];
  setList: React.Dispatch<React.SetStateAction<T[]>>;
  editing: T | null;
  setEditing: React.Dispatch<React.SetStateAction<T | null>>;
  isCreating: boolean;
  loading: boolean;
  handleSave: (entity: T) => Promise<void>;
  handleCancel: () => void;
  handleNew: () => void;
  handleEdit: (entity: T) => void;
}

export function useAdminCRUD<T extends { id?: number }>(
  cls: Constructor<T>
): AdminCRUDLogic<T> {
  const queryClient = useQueryClient();

  const queryKey = [cls.name];

  const { data: list = [], isLoading: loading } = useQuery<T[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchEntities(cls),
  });

  const [editing, setEditing] = useState<T | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { mutateAsync: saveMutation } = useMutation({
    mutationFn: (entity: T) => saveEntity(cls, entity),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const handleSave = useCallback(
    async (entity: T) => {
      try {
        await saveMutation(entity);
        setEditing(null);
        setIsCreating(false);
      } catch (error) {
        console.error(`Error guardando ${cls.name}:`, error);
        alert(
          `Error al guardar: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    [cls.name, saveMutation, queryClient, queryKey]
  );

  const handleNew = useCallback(() => {
    setEditing(new cls());
    setIsCreating(true);
  }, [cls]);

  const handleEdit = useCallback((entity: T) => {
    setEditing({ ...entity });
    setIsCreating(false);
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  return {
    list,
    setList: () => {},
    editing,
    setEditing,
    isCreating,
    loading,
    handleSave,
    handleCancel,
    handleNew,
    handleEdit,
  };
}

// src/hooks/useAdminCRUD.ts
import { useState, useEffect, useCallback } from 'react';
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
  const [list, setList] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(cls)
      .then((data) => setList(data as T[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cls]);

  const handleSave = useCallback(
    async (entity: T) => {
      try {
        const saved = await saveEntity(cls, entity);

        setList((prev) =>
          prev.some((item) => item.id === saved.id)
            ? prev.map((item) => (item.id === saved.id ? (saved as T) : item))
            : [...prev, saved as T]
        );
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
    [cls]
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
    setList,
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

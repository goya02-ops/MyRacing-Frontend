import { useState, useCallback } from 'react';
import { Category } from '../../../types/entities';
import { useEntityQuery } from '../../../hooks/useEntityQuery';
import { useEntityMutation } from '../../../hooks/useEntityMutation';

interface CategoryAdminLogic {
  list: Category[];
  editing: Category | null;
  isCreating: boolean;
  loading: boolean;
  handleSave: (category: Category) => Promise<void>;
  handleNewCategory: () => void;
  handleEditCategory: (category: Category) => void;
  handleCancel: () => void;
}

export function useCategoryAdmin(): CategoryAdminLogic {
  // 1. DATA FETCHING
  // Tu hook devuelve 'list' (ya comprobado en Membership)
  const { list = [], isLoading: loading } = useEntityQuery(Category);

  // 2. DATA MUTATION
  // CORRECCIÓN: Usamos 'saveEntity' que es lo que devuelve tu hook personalizado
  const { saveEntity: saveCategory } = useEntityMutation(Category);

  // 3. ESTADO LOCAL DE UI
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 4. HANDLERS
  const handleSave = useCallback(
    async (category: Category) => {
      try {
        // Llamamos a la función que obtuvimos del hook
        await saveCategory(category);
        setEditing(null);
        setIsCreating(false);
      } catch (error) {
        console.error('Error al guardar la categoría:', error);
        alert('Error al guardar la categoría.');
      }
    },
    [saveCategory]
  );

  const handleNewCategory = useCallback(() => {
    setEditing(new Category());
    setIsCreating(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditing({ ...category });
    setIsCreating(false);
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  return {
    list: list as Category[],
    editing,
    isCreating,
    loading,
    handleSave,
    handleNewCategory,
    handleEditCategory,
    handleCancel,
  };
}
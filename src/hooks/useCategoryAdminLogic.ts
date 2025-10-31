import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/apiMyRacing';

interface CategoryAdminLogic {
  list: Category[];
  editing: Category | null;
  isCreating: boolean;
  loading: boolean;

  handleSave: (category: Category) => Promise<void>;
  handleCancel: () => void;
  handleNewCategory: () => void;
  handleEditCategory: (category: Category) => void;
}

export function useCategoryAdminLogic(): CategoryAdminLogic {
  const [list, setList] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(Category as any) 
      .then((data) => setList(data as Category[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async (category: Category) => {
    try {
      const saved = await saveEntity(Category as any, category); 
      
      setList((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? (saved as Category) : c))
          : [...prev, saved as Category]
      );
      setEditing(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría.');
    }
  }, []);

  
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
    list,
    editing,
    isCreating,
    loading,
    handleSave,
    handleCancel,
    handleNewCategory,
    handleEditCategory,
  };
}
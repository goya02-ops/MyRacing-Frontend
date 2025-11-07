import { useState, useCallback } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';
import { Combination } from '../../../types/entities.ts';

interface CombinationWithId extends Combination {
  id?: number;
}

export function useCombinationAdmin() {
  const { list: rawList, isLoading: loadingCombinations } = useEntityQuery(Combination as any);
  
  const { saveEntity: mutateSave, isSaving } = useEntityMutation(Combination as any);

  const [editing, setEditing] = useState<CombinationWithId | null>(null);

  const list = rawList as CombinationWithId[];

  const handleSave = useCallback(async (combination: CombinationWithId) => {
    try {
      await mutateSave(combination);
      setEditing(null);
    } catch (error) {
      console.error('Mutation error:', error);
      alert('Error al guardar la combinación.');
    }
  }, [mutateSave]);

  const handleCancel = useCallback(() => {
    setEditing(null);
  }, []);

  const handleNew = useCallback(() => {
    setEditing(new Combination() as CombinationWithId);
  }, []);

  const handleEdit = useCallback((combination: CombinationWithId) => {
    setEditing({ ...combination });
  }, []);
 

  return {
    list,
    editing,
    setEditing,
    loading: loadingCombinations || isSaving, 
    handleSave,
    handleCancel,
    handleNew,
    handleEdit,
  };
}

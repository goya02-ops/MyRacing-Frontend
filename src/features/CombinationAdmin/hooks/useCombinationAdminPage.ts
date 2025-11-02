import { useState, useCallback } from 'react';
import { Combination } from '../../../types/entities.ts';
import { useCombinationAdmin } from './useCombinationAdmin.ts';
import { useCombinationFilters } from './useCombinationFilters.ts';
import { useScrollToElement } from '../../../hooks/useScrollToElement.ts';
import { isDuplicateCombination } from '../../../utils/combination/duplicate.ts';
import { normalizeCombination } from '../../../utils/combination/normalize.ts';

export function useCombinationAdminPage() {
  // Hook CRUD
  const crud = useCombinationAdmin();
  const {
    list,
    loading: loadingCombinations,
    handleSave: genericHandleSave,
    handleCancel: genericHandleCancel,
    handleNew: genericHandleNew,
    handleEdit: genericHandleEdit,
  } = crud;

  // Hook  Filtros
  const filters = useCombinationFilters(list);
  const { filteredList } = filters;

  // Estado de UI local (de la página)
  const [isCreating, setIsCreating] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Hook de Efecto de UI (scroll)
  const formContainerRef = useScrollToElement<HTMLDivElement>(crud.editing);

  // Handlers
  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);
      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }
      await genericHandleSave(normalized);
      setIsCreating(false);
    },
    [list, genericHandleSave]
  );

  const handleNewCombination = useCallback(() => {
    genericHandleNew();
    setIsCreating(true);
  }, [genericHandleNew]);

  const handleEditCombination = useCallback(
    (combination: Combination) => {
      genericHandleEdit(combination);
      setIsCreating(false);
    },
    [genericHandleEdit]
  );

  const handleCancel = useCallback(() => {
    genericHandleCancel();
    setIsCreating(false);
  }, [genericHandleCancel]);

  return {
    list,
    filteredList,
    editing: crud.editing,
    loading: loadingCombinations,
    isCreating,
    filtersVisible,
    setFiltersVisible,
    filters,
    formContainerRef,
    handleSave,
    handleNewCombination,
    handleEditCombination,
    handleCancel,
  };
}

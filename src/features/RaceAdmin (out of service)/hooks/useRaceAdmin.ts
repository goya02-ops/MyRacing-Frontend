import { useState, useEffect, useCallback } from 'react';
import { Race, Combination } from '../../../types/entities';
import { useAdminCRUD } from '../../../hooks/useAdminCRUD';
import { fetchEntities } from '../../../services/apiService';

interface RaceWithId extends Race {
  id?: number;
}

export function useRaceAdmin() {
  const crud = useAdminCRUD(Race as new () => RaceWithId);

  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loadingCombinations, setLoadingCombinations] = useState(true);

  useEffect(() => {
    fetchEntities(Combination)
      .then((combList) => {
        setCombinations(combList || []);
      })
      .catch((error) => {
        console.error('Error cargando combinaciones:', error);
        setCombinations([]);
      })
      .finally(() => {
        setLoadingCombinations(false);
      });
  }, []);

  const getCombinationName = useCallback(
    (combinationId?: number | any): string => {
      const id =
        typeof combinationId === 'object' ? combinationId?.id : combinationId;
      const comb = combinations.find((c) => c.id === id);
      if (comb) {
        return `ID ${comb.id} (Vueltas: ${comb.lapsNumber}, Paradas: ${comb.obligatoryStopsQuantity})`;
      }
      return 'N/A';
    },
    [combinations]
  );

  const isLoading = crud.loading || loadingCombinations;

  return {
    list: crud.list,
    editing: crud.editing,
    isCreating: crud.isCreating,
    loading: isLoading,
    handleSave: crud.handleSave,
    handleCancel: crud.handleCancel,
    handleNew: crud.handleNew,
    handleEdit: crud.handleEdit,
    combinations,
    getCombinationName,
  };
}

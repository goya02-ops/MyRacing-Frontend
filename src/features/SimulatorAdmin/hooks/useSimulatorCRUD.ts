import { useState, useEffect, useCallback } from 'react';
import { fetchEntities } from '../../../services/apiService';
import { Simulator } from '../../../types/entities';
import { handleSaveEntity as genericHandleSaveEntity } from '../../../utils/GlobalHandlers';

interface RelatedData {
  simulators: Simulator[];
  categories: any[];
  circuits: any[];
}

export function useSimulatorCRUD() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(
    null
  );
  const [isCreatingSimulator, setIsCreatingSimulator] = useState(false);
  const [loading, setLoading] = useState(true);

  //Carga simuladores
  useEffect(() => {
    setLoading(true);
    fetchEntities(Simulator as any)
      .then((data) => setSimulators(data as Simulator[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  //Handlers de estado de UI
  const handleCancelSimulator = useCallback(() => {
    setEditingSimulator(null);
    setIsCreatingSimulator(false);
  }, []);

  const handleNewSimulator = useCallback(() => {
    setEditingSimulator(new Simulator());
    setIsCreatingSimulator(true);
  }, []);

  const handleEditSimulator = useCallback((sim: Simulator) => {
    setEditingSimulator(sim);
    setIsCreatingSimulator(false);
  }, []);

  //Handler de guardado
  const handleSaveSimulator = useCallback(
    (sim: Simulator) => {
      const relatedData: RelatedData = {
        simulators,
        categories: [],
        circuits: [],
      };

      genericHandleSaveEntity(
        Simulator,
        sim,
        setSimulators as React.Dispatch<React.SetStateAction<Simulator[]>>,
        handleCancelSimulator,
        relatedData
      );
    },
    [simulators, handleCancelSimulator]
  );

  return {
    simulators,
    setSimulators,
    editingSimulator,
    isCreatingSimulator,
    loading,
    handleNewSimulator,
    handleEditSimulator,
    handleCancelSimulator,
    handleSaveSimulator,
  };
}

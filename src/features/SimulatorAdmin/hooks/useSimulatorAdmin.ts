import { useState, useCallback } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';
import { Simulator } from '../../../types/entities.ts'; 
import { toast } from '../../../components/tremor/toast/hook/useToast';

interface SimulatorWithId extends Simulator {
  id?: number;
}

export function useSimulatorAdmin() {
 
  const { list: rawList, isLoading: loadingSimulators } = useEntityQuery(
    Simulator as any
  );

  
  const { saveEntity: mutateSave, isSaving } = useEntityMutation(
    Simulator as any
  );


  const [editingSimulator, setEditingSimulator] =
    useState<SimulatorWithId | null>(null);

 
  const simulators = rawList as SimulatorWithId[];


  const handleSaveSimulator = useCallback(
    async (simulator: SimulatorWithId) => {
      try {
        await mutateSave(simulator);
        setEditingSimulator(null); 
      } catch (error) {
        console.error('Mutation error:', error);
        toast({
          variant: 'error',
          title: 'Error al guardar',
          description: 'No se pudo guardar el simulador.',
        });
      }
    },
    [mutateSave]
  );

  const handleCancelSimulator = useCallback(() => {
    setEditingSimulator(null);
  }, []);

  const handleNewSimulator = useCallback(() => {
 
    setEditingSimulator(new Simulator() as SimulatorWithId);
  }, []);

  const handleEditSimulator = useCallback((simulator: SimulatorWithId) => {
 
    setEditingSimulator({ ...simulator });
  }, []);


  const isCreatingSimulator = !!editingSimulator && !editingSimulator.id;


 return {
    simulators,
    editingSimulator,
    setEditingSimulator,
    loadingSimulators, 
    isSaving,          
    isCreatingSimulator,
    handleSaveSimulator,
    handleCancelSimulator,
    handleNewSimulator,
    handleEditSimulator,
  };
}
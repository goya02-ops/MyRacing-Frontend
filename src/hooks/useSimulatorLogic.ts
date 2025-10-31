import { useState, useEffect, useCallback } from 'react';
import { fetchEntities } from '../services/apiService';
import { Simulator, Category, Circuit } from '../types/entities';
import { handleSaveEntity } from '../utils/GlobalHandlers'; 

type ActiveManager = { type: 'category' | 'circuit' | null; simulator: Simulator | null; };

interface SimulatorLogic {
  simulators: Simulator[];
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  activeManager: ActiveManager;
  categories: Category[];
  circuits: Circuit[];
  loading: boolean;
  
  handleNewSimulator: () => void;
  handleEditSimulator: (sim: Simulator) => void;
  handleCancelSimulator: () => void;
  handleSaveSimulator: (sim: Simulator) => void;
  setActiveManager: React.Dispatch<React.SetStateAction<ActiveManager>>;
  
  handleSaveEntity: <T extends { id?: number }>(
    entityClass: new () => T,
    entity: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    onSuccess: () => void,
    duplicateCheck?: (entity: T) => boolean
  ) => Promise<void>;
}

export function useSimulatorLogic(): SimulatorLogic {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(null);
  const [isCreatingSimulator, setIsCreatingSimulator] = useState(false);
  const [activeManager, setActiveManager] = useState<ActiveManager>({ type: null, simulator: null });
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(Simulator as any)
      .then((data) => setSimulators(data as Simulator[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const shouldFetch = activeManager.type !== null && (categories.length === 0 || circuits.length === 0);
    if (!shouldFetch) return;

    const fetchFormData = async () => {
      try {
        setCategories(await fetchEntities(Category as any));
        setCircuits(await fetchEntities(Circuit as any));
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchFormData();
  }, [activeManager.type, categories.length, circuits.length]);


  const handleCancelSimulator = useCallback(() => {
    setEditingSimulator(null);
    setIsCreatingSimulator(false);
  }, []);

  const handleNewSimulator = useCallback(() => {
    setEditingSimulator(new Simulator());
    setIsCreatingSimulator(true);
    setActiveManager({ type: null, simulator: null });
  }, []);

  const handleEditSimulator = useCallback((sim: Simulator) => {
    setEditingSimulator(sim);
    setIsCreatingSimulator(false);
    setActiveManager({ type: null, simulator: null });
  }, []);

  const handleSaveSimulator = useCallback((sim: Simulator) => {
    const relatedData = { simulators, categories, circuits };
    
    handleSaveEntity(
      Simulator as any,
      sim,
      setSimulators as React.Dispatch<React.SetStateAction<Simulator[]>>,
      () => { 
        setEditingSimulator(null);
        setIsCreatingSimulator(false);
      },
      relatedData 
    );
  }, [simulators, categories, circuits]);


  const saveEntityBound = useCallback(<T extends { id?: number }>(
    entityClass: new () => T,
    entity: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    onSuccess: () => void,
    duplicateCheck?: (entity: T) => boolean
  ): Promise<void> => {
    const relatedData = { simulators, categories, circuits };

    return handleSaveEntity(entityClass, entity, setter, onSuccess, relatedData, duplicateCheck);
  }, [simulators, categories, circuits]);


  return {
    simulators, editingSimulator, isCreatingSimulator, activeManager,
    categories, circuits, loading,
    handleNewSimulator, handleEditSimulator, handleCancelSimulator, handleSaveSimulator,
    setActiveManager,
    handleSaveEntity: saveEntityBound,
  };
}
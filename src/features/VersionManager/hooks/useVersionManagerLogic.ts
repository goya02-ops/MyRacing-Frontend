import { useState, useCallback, useMemo } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';
import { getRelationId } from '../../../utils/GlobalHandlers';
import {
  Simulator,
  CategoryVersion,
  CircuitVersion,
} from '../../../types/entities';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};


export function useVersionManagerLogic(activeManager: ActiveManager) {

  const [editingVersion, setEditingVersion] = useState<
    CategoryVersion | CircuitVersion | null
  >(null);
  

  const isCreatingVersion = !!editingVersion && !editingVersion.id;

  const isCategory = activeManager.type === 'category';
  const simulatorId = activeManager.simulator?.id;
  const title = isCategory ? 'Categorías' : 'Circuitos';

 
  const { list: allCategoryVersions, isLoading: loadingCategories } =
    useEntityQuery(CategoryVersion as any);
  const { list: allCircuitVersions, isLoading: loadingCircuits } =
    useEntityQuery(CircuitVersion as any);

 
  const categoryVersions = useMemo(() => {
    if (!simulatorId) return [];
    return (allCategoryVersions as any[]).filter(
      (v: any) => getRelationId(v, 'simulator') === simulatorId
    ) as CategoryVersion[];
  }, [allCategoryVersions, simulatorId]);

  const circuitVersions = useMemo(() => {
    if (!simulatorId) return [];
    return (allCircuitVersions as any[]).filter(
      (v: any) => getRelationId(v, 'simulator') === simulatorId
    ) as CircuitVersion[];
  }, [allCircuitVersions, simulatorId]);

  const currentVersions = isCategory ? categoryVersions : circuitVersions;


  const { saveEntity: saveCategory, isSaving: isSavingCategory } =
    useEntityMutation(CategoryVersion as any);
  const { saveEntity: saveCircuit, isSaving: isSavingCircuit } =
    useEntityMutation(CircuitVersion as any);

  const handleNewVersion = useCallback(() => {
    const newVersion = isCategory
      ? new CategoryVersion()
      : new CircuitVersion();
    newVersion.simulator = activeManager.simulator!;
    setEditingVersion(newVersion);

  }, [isCategory, activeManager.simulator]);

  const handleEditVersion = useCallback(
    (version: CategoryVersion | CircuitVersion) => {
      setEditingVersion({ ...version }); // Copiamos para no mutar la caché
    },
    []
  );

  const handleCancelVersion = useCallback(() => {
    setEditingVersion(null);
  }, []);

 
  const isDuplicate = useCallback(
    (version: any, entityType: 'category' | 'circuit') => {
      return currentVersions.some(
        (item: any) =>
          getRelationId(item, entityType) ===
            getRelationId(version, entityType) &&
          getRelationId(item, 'simulator') ===
            getRelationId(version, 'simulator') &&
          item.id !== version.id
      );
    },
    [currentVersions]
  );

  const onSaveCategoryVersion = useCallback(
    async (v: CategoryVersion) => {
      if (isDuplicate(v, 'category')) {
        alert('Error: Ya existe una versión para esa categoría.');
        return;
      }
      try {
        await saveCategory(v);
        handleCancelVersion(); // Cerramos el form al éxito
      } catch (error) {
        console.error('Error saving CategoryVersion:', error);
        alert('Error al guardar la categoría.');
      }
    },
    [saveCategory, handleCancelVersion, isDuplicate]
  );

  const onSaveCircuitVersion = useCallback(
    async (v: CircuitVersion) => {
      if (isDuplicate(v, 'circuit')) {
        alert('Error: Ya existe una versión para ese circuito.');
        return;
      }
      try {
        await saveCircuit(v);
        handleCancelVersion(); // Cerramos el form al éxito
      } catch (error) {
        console.error('Error saving CircuitVersion:', error);
        alert('Error al guardar el circuito.');
      }
    },
    [saveCircuit, handleCancelVersion, isDuplicate]
  );

  
  return {
    categoryVersions,
    circuitVersions,
    editingVersion,
    isCreatingVersion, 
    title,
    isCategory,
    loading: loadingCategories || loadingCircuits, 
    isSaving: isSavingCategory || isSavingCircuit, 
    handleNewVersion,
    handleEditVersion,
    handleCancelVersion,
    onSaveCategoryVersion, 
    onSaveCircuitVersion
  };
}
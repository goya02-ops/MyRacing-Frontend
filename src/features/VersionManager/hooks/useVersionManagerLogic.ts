import { useState, useEffect, useCallback } from 'react';
import { fetchEntities } from '../../../services/apiService';
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

type HandleSaveEntityBound = <T extends { id?: number }>(
  entityClass: new () => T,
  entity: T,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  onSuccess: () => void,
  duplicateCheck?: (entity: T) => boolean
) => Promise<void>;

interface VersionManagerLogic {
  categoryVersions: CategoryVersion[];
  circuitVersions: CircuitVersion[];
  editingVersion: CategoryVersion | CircuitVersion | null;
  isCreatingVersion: boolean;
  title: string;
  isCategory: boolean;

  handleNewVersion: () => void;
  handleEditVersion: (version: CategoryVersion | CircuitVersion) => void;
  handleCancelVersion: () => void;
  onSaveCategoryVersion: (v: CategoryVersion) => void;
  onSaveCircuitVersion: (v: CircuitVersion) => void;
}

export function useVersionManagerLogic(
  activeManager: ActiveManager,
  handleSaveEntity: HandleSaveEntityBound
): VersionManagerLogic {
  const [categoryVersions, setCategoryVersions] = useState<CategoryVersion[]>(
    []
  );
  const [circuitVersions, setCircuitVersions] = useState<CircuitVersion[]>([]);
  const [editingVersion, setEditingVersion] = useState<
    CategoryVersion | CircuitVersion | null
  >(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  const isCategory = activeManager.type === 'category';
  const title = isCategory ? 'Categorías' : 'Circuitos';
  const currentVersions = isCategory ? categoryVersions : circuitVersions;

  useEffect(() => {
    if (!activeManager.simulator) return;

    const fetchVersions = async () => {
      try {
        if (activeManager.type === 'category') {
          const allVersions = await fetchEntities(CategoryVersion as any);
          setCategoryVersions(
            allVersions.filter(
              (v: any) =>
                getRelationId(v, 'simulator') === activeManager.simulator?.id
            ) as CategoryVersion[]
          );
        } else if (activeManager.type === 'circuit') {
          const allVersions = await fetchEntities(CircuitVersion as any);
          setCircuitVersions(
            allVersions.filter(
              (v: any) =>
                getRelationId(v, 'simulator') === activeManager.simulator?.id
            ) as CircuitVersion[]
          );
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };
    setEditingVersion(null);
    setIsCreatingVersion(false);
    fetchVersions();
  }, [activeManager]);

  const handleNewVersion = useCallback(() => {
    const newVersion = isCategory
      ? new CategoryVersion()
      : new CircuitVersion();
    newVersion.simulator = activeManager.simulator!;
    setEditingVersion(newVersion);
    setIsCreatingVersion(true);
  }, [isCategory, activeManager.simulator]);

  const handleEditVersion = useCallback(
    (version: CategoryVersion | CircuitVersion) => {
      setEditingVersion(version);
      setIsCreatingVersion(false);
    },
    []
  );

  const handleCancelVersion = useCallback(() => {
    setEditingVersion(null);
    setIsCreatingVersion(false);
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
    (v: CategoryVersion) => {
      handleSaveEntity(
        CategoryVersion as any,
        v,
        setCategoryVersions as React.Dispatch<
          React.SetStateAction<CategoryVersion[]>
        >,
        handleCancelVersion,
        (version: CategoryVersion) => isDuplicate(version, 'category')
      );
    },
    [handleSaveEntity, handleCancelVersion, isDuplicate]
  );

  const onSaveCircuitVersion = useCallback(
    (v: CircuitVersion) => {
      handleSaveEntity(
        CircuitVersion as any,
        v,
        setCircuitVersions as React.Dispatch<
          React.SetStateAction<CircuitVersion[]>
        >,
        handleCancelVersion,
        (version: CircuitVersion) => isDuplicate(version, 'circuit')
      );
    },
    [handleSaveEntity, handleCancelVersion, isDuplicate]
  );

  return {
    categoryVersions,
    circuitVersions,
    editingVersion,
    isCreatingVersion,
    title,
    isCategory,
    handleNewVersion,
    handleEditVersion,
    handleCancelVersion,
    onSaveCategoryVersion,
    onSaveCircuitVersion,
  };
}

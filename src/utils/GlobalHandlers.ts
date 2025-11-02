import { saveEntity } from '../services/apiService';

export const getRelationId = (
  entity: any,
  relationName: string
): number | null => {
  const relation = entity[relationName];
  if (relation === null || relation === undefined) return null;
  return typeof relation === 'object' ? relation.id : relation;
};

export const handleSaveEntity = async <T extends { id?: number }>(
  entityClass: new () => T,
  entity: T,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  onSuccess: () => void,
  duplicateCheck?: (entity: T) => boolean
) => {
  if (duplicateCheck && duplicateCheck(entity)) {
    alert(`Duplicated: ${entityClass}`);
    return;
  }

  const entityToSave: any = { ...entity };
  for (const key in entityToSave) {
    const value = entityToSave[key];
    if (typeof value === 'object' && value !== null && 'id' in value) {
      entityToSave[key] = (value as any).id;
    }
  }

  try {
    const saved = await saveEntity(entityClass, entityToSave as T);

    setter((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === saved.id);
      if (existingIndex > -1) {
        const newArray = [...prev];
        newArray[existingIndex] = saved as T;
        return newArray;
      } else {
        return [...prev, saved as T];
      }
    });

    onSuccess();
  } catch (error) {
    console.error('Error guardando:', error);
    alert(`Error al guardar: ${error}`);
  }
};

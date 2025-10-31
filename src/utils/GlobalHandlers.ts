import { saveEntity } from '../services/apiService'; 
import type { Simulator, Category, Circuit } from '../types/entities'; 
interface RelatedData {
    simulators: Simulator[];
    categories: Category[];
    circuits: Circuit[];
}

export const getRelationId = (entity: any, relationName: string): number | null => {
  const relation = entity[relationName];
  if (relation === null || relation === undefined) return null;
  return typeof relation === 'object' ? relation.id : relation;
};

/**
 * Función genérica para guardar/actualizar cualquier entidad (CRUD genérico).
 * @param entityClass La clase de la entidad (e.g., Simulator)
 * @param entity El objeto con los datos a guardar
 * @param relatedData Los arrays de entidades necesarias para 'hidratar' el objeto guardado
 */
export const handleSaveEntity = async <T extends { id?: number }>(
  entityClass: new () => T,
  entity: T,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  onSuccess: () => void,
  relatedData: RelatedData,
  duplicateCheck?: (entity: T) => boolean
) => {
  if (duplicateCheck && duplicateCheck(entity)) {
    alert('Esta combinación ya existe.');
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

    const hydratedSaved: any = { ...saved };
    const rd = relatedData; 
    
    if ('category' in saved) {
      hydratedSaved.category = rd.categories.find((c) => c.id === getRelationId(saved, 'category')) || (saved as any).category;
    }
    if ('circuit' in saved) {
      hydratedSaved.circuit = rd.circuits.find((c) => c.id === getRelationId(saved, 'circuit')) || (saved as any).circuit;
    }
    if ('simulator' in saved) {
      hydratedSaved.simulator = rd.simulators.find((s) => s.id === getRelationId(saved, 'simulator')) || (saved as any).simulator;
    }

    setter((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === saved.id);
      if (existingIndex > -1) {
        const newArray = [...prev];
        newArray[existingIndex] = hydratedSaved as T;
        return newArray;
      } else {
        return [...prev, hydratedSaved as T];
      }
    });

    onSuccess();
  } catch (error) {
    console.error('Error guardando:', error);
    alert(`Error al guardar: ${error}`);
  }
};
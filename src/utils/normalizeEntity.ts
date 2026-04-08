/**
 * Normaliza las relaciones de una entidad para enviar al backend.
 * Convierte objetos de relación con solo id (ej: { id: 1, name: "test" }) 
 * en objetos planos { id: 1 }.
 * 
 * @param entity - La entidad a normalizar
 * @returns La entidad normalizada lista para enviar a la API
 */
export function normalizeRelations<T>(entity: T): T {
  return JSON.parse(
    JSON.stringify(entity, (_key, value) => {
      if (
        value &&
        typeof value === 'object' &&
        'id' in value &&
        Object.keys(value).length === 1
      ) {
        return { id: value.id };
      }
      return value;
    })
  );
}

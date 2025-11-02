import type { Constructor } from '../types/entityMeta.ts';
import { entityMetaByClass } from '../types/entityMeta.ts';
import { fetchWithAuth } from './apiClient.ts';

export async function fetchEntities<T>(cls: Constructor<T>): Promise<T[]> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');
  const res = await fetchWithAuth(`${metadata.endpoint}`);
  const json = await res.json();
  return json.data;
}

export async function fetchOne<T extends { id?: number }>(
  cls: Constructor<T>,
  entity: T
): Promise<T> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');
  const res = await fetchWithAuth(`${metadata.endpoint}/${entity.id}`);
  const json = await res.json();
  return json.data;
}
export async function saveEntity<T extends { id?: number }>(
  cls: Constructor<T>,
  entity: T
): Promise<T> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');

  //  Normalizar relaciones: si hay objetos con solo id, convertirlos a { id }
  const normalized = JSON.parse(
    JSON.stringify(entity, (key, value) => {
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

  const method = entity.id ? 'PUT' : 'POST';
  const url = entity.id
    ? `${metadata.endpoint}/${entity.id}`
    : `${metadata.endpoint}`;
  const res = await fetchWithAuth(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteEntity<T>(
  cls: Constructor<T>,
  id: number
): Promise<void> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');
  const res = await fetchWithAuth(`${metadata.endpoint}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error eliminando entidad');
}

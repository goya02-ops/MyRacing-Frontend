import type { Constructor } from '../types/entityMeta.ts';
import { entityMetaByClass } from '../types/entityMeta.ts';
import { fetchWithAuth } from './apiClient.ts';
import { normalizeRelations } from '../utils/normalizeEntity.ts';
import { errorMessageFrom } from './apiError.ts';

async function throwIfNotOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  throw new Error(await errorMessageFrom(res, fallback));
}

export async function fetchEntities<T>(cls: Constructor<T>): Promise<T[]> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');
  const res = await fetchWithAuth(`${metadata.endpoint}`);
  await throwIfNotOk(res, 'Error al obtener la lista');
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
  await throwIfNotOk(res, 'Error al obtener la entidad');
  const json = await res.json();
  return json.data;
}
export async function saveEntity<T extends { id?: number }>(
  cls: Constructor<T>,
  entity: T
): Promise<T> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');

  const normalized = normalizeRelations(entity);

  const method = entity.id ? 'PUT' : 'POST';
  const url = entity.id
    ? `${metadata.endpoint}/${entity.id}`
    : `${metadata.endpoint}`;
  const res = await fetchWithAuth(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  });
  await throwIfNotOk(res, 'Error al guardar la entidad');
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

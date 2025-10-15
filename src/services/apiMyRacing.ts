import { entityMetaByClass } from '../types/entityMeta';
import type { Constructor } from '../types/entityMeta';

const API_BASE = 'http://localhost:3000/api';

export async function fetchEntities<T>(cls: Constructor<T>): Promise<T[]> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');

  const res = await fetch(`${API_BASE}${metadata.endpoint}`);
  const json = await res.json();
  return json.data;
}

export async function fetchOne<T extends { id?: number }>(
  cls: Constructor<T>,
  entity: T
): Promise<T> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');

  const res = await fetch(`${API_BASE}${metadata.endpoint}/${entity.id}`);
  const json = await res.json();
  return json.data;
}

export async function saveEntity<T extends { id?: number }>(
  cls: Constructor<T>,
  entity: T
): Promise<T> {
  const metadata = entityMetaByClass.get(cls);
  if (!metadata) throw new Error('Clase no registrada');

  const method = entity.id ? 'PUT' : 'POST';
  const url = entity.id
    ? `${API_BASE}${metadata.endpoint}/${entity.id}`
    : `${API_BASE}${metadata.endpoint}`;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entity),
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

  const res = await fetch(`${API_BASE}${metadata.endpoint}/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) throw new Error('Error eliminando entidad');
}
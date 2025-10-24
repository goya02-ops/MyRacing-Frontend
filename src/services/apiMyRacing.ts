import { Combination, RaceUser } from '../types/entities.ts';
import { entityMetaByClass } from '../types/entityMeta';
import type { Constructor } from '../types/entityMeta';

const API_BASE_URL = 'http://localhost:3000/api';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Refresh token expired');
  }
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        onRefreshed(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      } catch (error) {
        isRefreshing = false;
        throw error;
      }
    } else {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          headers['Authorization'] = `Bearer ${token}`;
          resolve(fetch(`${API_BASE_URL}${url}`, { ...options, headers }));
        });
      });
    }
  }
  return response;
}

export function getStoredUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

export function isAdmin() {
  const user = getStoredUser();
  return user && user.type === 'Admin';
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  //window.location.href = '/login';
  //Comento esto así no me redirige al login automáticamente
}

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

export async function fetchCurrentRaces(): Promise<Combination[]> {
  const metadata = entityMetaByClass.get(Combination);
  const res = await fetchWithAuth(`${metadata!.endpoint}/races/`);
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

export async function registerUserToRace(
  userId: number,
  raceId: number
): Promise<RaceUser> {
  const res = await fetchWithAuth(`/race-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      raceId,
    }),
  });

  if (!res.ok) {
    throw new Error('Error al inscribirse');
  }

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

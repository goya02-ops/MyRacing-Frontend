import { RaceUser } from '../types/entities.ts';
import { fetchWithAuth } from './apiClient.ts';
import { API_ROUTES } from './apiRoutes';
import { throwApiError } from './apiError.ts';

async function fetchRaceUsers(
  url: string,
  errorMessage: string,
): Promise<RaceUser[]> {
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    return await throwApiError(response, errorMessage);
  }

  const data = await response.json();
  return (data.data || data) as RaceUser[];
}

/**
 * Carreras del usuario autenticado (GET /race-users/my-races).
 * No requiere rol admin: el backend resuelve el usuario desde el token.
 */
export async function fetchMyRaceUsers(): Promise<RaceUser[]> {
  try {
    return await fetchRaceUsers(
      API_ROUTES.RACE_USERS.MY_RACES,
      'No se pudieron obtener tus carreras.',
    );
  } catch (error) {
    console.error('Error fetching my race users:', error);
    throw error;
  }
}

/**
 * Carreras de un usuario cualquiera (GET /race-users/by-user?userId=).
 * Requiere rol admin: el parámetro no es decorativo, cambia el endpoint.
 */
export async function fetchRaceUsersByUserId(
  userId: number,
): Promise<RaceUser[]> {
  try {
    return await fetchRaceUsers(
      API_ROUTES.RACE_USERS.BY_USER(userId),
      'No se pudieron obtener las carreras de este usuario.',
    );
  } catch (error) {
    console.error('Error fetching race users:', error);
    throw error;
  }
}

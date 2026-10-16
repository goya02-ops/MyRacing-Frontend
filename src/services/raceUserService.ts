import { RaceUser } from '../types/entities.ts';
import { fetchWithAuth } from './apiClient.ts';
import { API_ROUTES } from './apiRoutes';
import { throwApiError } from './apiError.ts';

export async function fetchRaceUsersByUserId(
  userId: number
): Promise<RaceUser[]> {
  void userId;
  try {
    // Use /my-races endpoint which doesn't require admin role
    const response = await fetchWithAuth(API_ROUTES.RACE_USERS.MY_RACES);

    if (!response.ok) {
      return await throwApiError(response, 'No se pudieron obtener tus carreras.');
    }

    const data = await response.json();
    return (data.data || data) as RaceUser[];
  } catch (error) {
    console.error('Error fetching race users:', error);
    throw error;
  }
}
import { RaceUser } from '../types/entities.ts';
import { fetchWithAuth } from './apiClient.ts';
import { API_ROUTES } from './apiRoutes';

export async function fetchRaceUsersByUserId(
  userId: number
): Promise<RaceUser[]> {
  try {
    // Use /my-races endpoint which doesn't require admin role
    const response = await fetchWithAuth(API_ROUTES.RACE_USERS.MY_RACES);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Error al obtener carreras del usuario. Status: ${response.status}. Body: ${errorBody}`
      );
    }
    
    const data = await response.json();
    return (data.data || data) as RaceUser[];
  } catch (error) {
    console.error('Error fetching race users:', error);
    throw error;
  }
}
import { RaceUser } from '../types/entities.ts';

const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchRaceUsersByUserId(
  userId: number
): Promise<RaceUser[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/race-users/by-user?userId=${userId}`
    );

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

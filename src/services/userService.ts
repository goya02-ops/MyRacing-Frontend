import { fetchWithAuth } from './apiClient';
import { fetchRaceUsersByUserId } from './raceUserService.ts';
import { User, Race } from '../types/entities';
import { API_ROUTES } from './apiRoutes';

// Representa la relación entre un usuario y una carrera en la API
// Incluye posiciones de largada y llegada, y referencias a Race y User
interface RaceUserApi {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: Race;
  user: User;
}

export type { RaceUserApi };

// Estructura de datos para el perfil del usuario
// Contiene el usuario y un array de sus carreras completadas
interface ProfileData {
  user: User;
  results: RaceUserApi[];
}


export async function fetchMyProfile(): Promise<ProfileData> {
  const userResponse = await fetchWithAuth(API_ROUTES.USERS.ME);
  if (!userResponse.ok) {
    throw new Error('Error al obtener los datos del usuario.');
  }
  const userData = (await userResponse.json()).data;
  const userId = userData.id;

  const racesData = await fetchRaceUsersByUserId(userId);

  return {
    user: userData as User,
    results: racesData as unknown as RaceUserApi[],
  };
}


export async function updateMyProfile(
  realName: string,
  email: string
): Promise<User> {
  const response = await fetchWithAuth(API_ROUTES.USERS.ME, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      realName: realName,
      email: email,
    }),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar el perfil del usuario.');
  }

  const updatedData = (await response.json()).data;
  return updatedData as User;
}

// Para admins - ver cualquier usuario
export async function fetchUserById(userId: number): Promise<User> {
  const userResponse = await fetchWithAuth(API_ROUTES.USERS.BY_ID(userId));
  if (!userResponse.ok) {
    throw new Error('Error al obtener los datos del usuario.');
  }
  const userData = (await userResponse.json()).data;
  return userData as User;
}

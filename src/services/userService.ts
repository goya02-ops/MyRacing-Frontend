import { fetchWithAuth } from './apiClient';
import { User } from '../types/entities';

interface RaceUserApi {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: any;
  user: any;
}

interface ProfileData {
  user: User;
  results: RaceUserApi[];
}


export async function fetchMyProfile(): Promise<ProfileData> {
  const userResponse = await fetchWithAuth('/users/me');
  if (!userResponse.ok) {
    throw new Error('No se pudieron obtener los datos del usuario.');
  }
  const userData = (await userResponse.json()).data;

  const racesResponse = await fetchWithAuth('/race-users/my-races');
  const racesData = (await racesResponse.json()).data || [];

  return {
    user: userData as User,
    results: racesData as RaceUserApi[],
  };
}


export async function updateMyProfile(
  realName: string,
  email: string
): Promise<User> {
  const response = await fetchWithAuth('/users/me', {
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
    throw new Error('Error al actualizar perfil en el servidor.');
  }

  const updatedData = (await response.json()).data;
  return updatedData as User;
}

// Para admins - ver cualquier usuario
export async function fetchUserById(userId: number): Promise<User> {
  const userResponse = await fetchWithAuth(`/users/${userId}`);
  if (!userResponse.ok) {
    throw new Error('No se pudieron obtener los datos del usuario.');
  }
  const userData = (await userResponse.json()).data;
  return userData as User;
}
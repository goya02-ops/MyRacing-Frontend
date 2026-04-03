// Importa el núcleo HTTP y los helpers de sesión
import { fetchWithAuth } from './apiClient';
import { getStoredUser } from './authService';
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

export async function fetchProfileData(): Promise<ProfileData> {
  const currentUser = getStoredUser();
  
  if (!currentUser || !currentUser.id) {
    throw new Error('Usuario no autenticado en almacenamiento local.');
  }
  
  const userResponse = await fetchWithAuth(`/users/${currentUser.id}`);
  if (!userResponse.ok) {
    throw new Error('No se pudieron obtener los datos del usuario.');
  }
  const userData = (await userResponse.json()).data;
  
  const racesResponse = await fetchWithAuth(
    `/race-users/by-user?userId=${currentUser.id}`
  );
  const racesData = (await racesResponse.json()).data || [];

  return {
    user: userData as User,
    results: racesData as RaceUserApi[],
  };
}

export async function updateProfileData(
  userId: number,
  realName: string,
  email: string
): Promise<User> {
  const response = await fetchWithAuth(`/users/${userId}`, {
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

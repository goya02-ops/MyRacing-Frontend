export interface RaceUserResponse {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: {
    raceDateTime: string | Date;
  
  }; 
  user: any; // El hook y la página usan el 'selectedUser', pero la API devuelve el user aquí también
}

const API_BASE_URL = 'http://localhost:3000/api';


export async function fetchRaceUsersByUserId(userId: number): Promise<RaceUserResponse[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/race-users/by-user?userId=${userId}`
    );

    if (!response.ok) {
      const errorBody = await response.text(); 
      throw new Error(`Error al obtener carreras del usuario. Status: ${response.status}. Body: ${errorBody}`);
    }

    const data = await response.json();
    return (data.data || data) as RaceUserResponse[];
  } catch (error) {
    console.error('Error fetching race users:', error);
    throw error;
  }
}
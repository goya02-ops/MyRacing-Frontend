import { Combination, Race, RaceUser } from '../types/entities.ts';
import { entityMetaByClass } from '../types/entityMeta.ts';
import { fetchWithAuth } from './apiClient.ts';

export async function fetchCurrentCombinations(): Promise<Combination[]> {
  const metadata = entityMetaByClass.get(Combination);
  const res = await fetchWithAuth(`${metadata!.endpoint}/races/`);
  const json = await res.json();
  return json.data;
}

export interface CombinationRacesResponse {
  previousRaces: Race[];
  nextRaces: Race[];
}

export async function fetchRacesForCombination(
  combinationId: number,
  previousLimit: number = 5,
  nextLimit: number = 10
): Promise<CombinationRacesResponse> {
  const metadata = entityMetaByClass.get(Race);

  const url = `${
    metadata!.endpoint
  }/by-combination/${combinationId}/${previousLimit}/${nextLimit}`;

  const res = await fetchWithAuth(url);
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

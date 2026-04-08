// src/features/AvailableRaces/hooks/useCombinationRaces.ts
import { useQuery } from '@tanstack/react-query';
import type { CombinationRacesResponse } from '../../../services/raceService.ts';
import { fetchRacesForCombination } from '../../../services/raceService.ts';
import { createRacesForCombinationKey } from '../../../utils/queryKeys';

// Límites
const PREVIOUS_LIMIT = 5;
const NEXT_LIMIT = 10;

const defaultData: CombinationRacesResponse = {
  previousRaces: [],
  nextRaces: [],
};

export function useCombinationRaces(combinationId: number | null | undefined) {
  const queryKey = createRacesForCombinationKey(combinationId!);

  const { data: racesData = defaultData, isLoading: isLoadingRaces } = useQuery<
    CombinationRacesResponse,
    Error
  >({
    queryKey: queryKey,
    queryFn: () =>
      fetchRacesForCombination(combinationId!, PREVIOUS_LIMIT, NEXT_LIMIT),

    enabled: !!combinationId,
  });

  return { racesData, isLoadingRaces };
}

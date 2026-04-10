import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Combination, Simulator } from '../../../types/entities.ts';
import { fetchCurrentCombinations } from '../../../services/raceService.ts';
import { QUERY_KEYS } from '../../../utils/queryKeys';

const deriveSimulators = (combs: Combination[]): Simulator[] => {
  const simsMap = new Map<number, Simulator>();
  combs.forEach((c) => {
    if (c.categoryVersion?.simulator) {
      simsMap.set(c.categoryVersion.simulator.id!, c.categoryVersion.simulator);
    }
    if (c.circuitVersion?.simulator) {
      simsMap.set(c.circuitVersion.simulator.id!, c.circuitVersion.simulator);
    }
  });
  return Array.from(simsMap.values());
};

export function useCurrentCombinations() {
  const queryKey = [QUERY_KEYS.COMBINATIONS];

  const { data: allCombinations = [], isLoading: isLoadingCombinations } =
    useQuery<Combination[], Error>({
      queryKey: queryKey,
      queryFn: fetchCurrentCombinations,
      staleTime: 5 * 60 * 1000,
    });

  const simulatorsWithRaces = useMemo(() => {
    return deriveSimulators(allCombinations);
  }, [allCombinations]);

  return {
    allCombinations,
    simulatorsWithRaces,
    isLoadingCombinations,
  };
}

import { useEffect, useState } from 'react';
import { Combination, Simulator } from '../types/entities.ts';
import { fetchCurrentRaces } from '../services/raceService.ts';

export function useCurrentRaces() {
  const [allCombinations, setAllCombinations] = useState<Combination[]>([]);
  const [simulatorsWithRaces, setSimulatorsWithRaces] = useState<Simulator[]>(
    []
  );

  useEffect(() => {
    fetchCurrentRaces()
      .then((combs) => {
        setAllCombinations(combs);
        // Derivar simuladores unicos con combinaciones vigentes
        const simsMap = new Map<number, Simulator>();
        combs.forEach((c) => {
          if (c.categoryVersion?.simulator) {
            simsMap.set(
              c.categoryVersion.simulator.id!,
              c.categoryVersion.simulator
            );
          }
          if (c.circuitVersion?.simulator) {
            simsMap.set(
              c.circuitVersion.simulator.id!,
              c.circuitVersion.simulator
            );
          }
        });
        setSimulatorsWithRaces(Array.from(simsMap.values()));
      })
      .catch(console.error);
  }, []);

  return { allCombinations, simulatorsWithRaces };
}

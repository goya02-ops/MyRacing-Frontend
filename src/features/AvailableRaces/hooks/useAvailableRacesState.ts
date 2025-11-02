// src/hooks/useAvailableRacesState.ts
import { useEffect, useMemo, useState } from 'react';
import { Combination, Simulator } from '../../../types/entities';
import { useCurrentRaces } from './useCurrentRaces';
import { useNextFiveRaces } from './useNextFiveRaces';
import { useCountdown } from '../../../hooks/useCountdown';

export function useAvailableRacesState() {
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  const { allCombinations, simulatorsWithRaces } = useCurrentRaces();

  useEffect(() => {
    if (allCombinations || simulatorsWithRaces) {
      setLoading(false);
    }
  }, [allCombinations, simulatorsWithRaces]);

  const filteredCombinations = useMemo(() => {
    if (!selectedSimulator) return allCombinations;
    return allCombinations.filter(
      (c) =>
        c.categoryVersion?.simulator?.id === selectedSimulator.id ||
        c.circuitVersion?.simulator?.id === selectedSimulator.id
    );
  }, [allCombinations, selectedSimulator]);

  const nextFiveRaces = useNextFiveRaces(selectedCombination);
  const countdown = useCountdown(
    nextFiveRaces.length > 0
      ? new Date(nextFiveRaces[0].registrationDeadline)
      : null
  );

  const resetSelection = () => {
    setSelectedSimulator(null);
    setSelectedCombination(null);
  };

  return {
    loading,
    selectedSimulator,
    setSelectedSimulator,
    selectedCombination,
    setSelectedCombination,
    simulatorsWithRaces,
    filteredCombinations,
    nextFiveRaces,
    countdown,
    resetSelection,
  };
}

import { useMemo, useState } from 'react';
import { Combination, Simulator } from '../../../types/entities';
import { useCurrentCombinations } from './useCurrentCombinations';
import { useCombinationRaces } from './useCombinationRaces';
import { useCountdown } from '../../../hooks/useCountdown';

export function useAvailableRacesState() {
  // Estado local de UI
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);

  // Carga de Combinaciones
  const { allCombinations, simulatorsWithRaces, isLoadingCombinations } =
    useCurrentCombinations();

  // Carga de Carreras
  const { racesData, isLoadingRaces } = useCombinationRaces(
    selectedCombination?.id
  );

  // Lógica de filtrado
  const filteredCombinations = useMemo(() => {
    if (!selectedSimulator) return allCombinations;
    return allCombinations.filter(
      (c) => c.categoryVersion?.simulator?.id === selectedSimulator.id
    );
  }, [allCombinations, selectedSimulator]);

  // Lógica de separación de carreras
  const { nextRaces, pastRaces } = useMemo(() => {
    const upcoming = racesData.nextRaces || [];
    const past = racesData.previousRaces || [];

    return { nextRaces: upcoming, pastRaces: past };
  }, [racesData]);

  // El countdown usa la primera carrera de la lista filtrada
  const countdown = useCountdown(
    nextRaces.length > 0 ? new Date(nextRaces[0].registrationDeadline) : null
  );

  const resetSelection = () => {
    setSelectedSimulator(null);
    setSelectedCombination(null);
  };

  return {
    loading: isLoadingCombinations,
    isLoadingRaces,
    selectedSimulator,
    setSelectedSimulator,
    selectedCombination,
    setSelectedCombination,
    simulatorsWithRaces,
    filteredCombinations,
    nextRaces,
    pastRaces,
    countdown,
    resetSelection,
  };
}

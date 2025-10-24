import { lazy } from 'react';
import { Button } from '../components/tremor/TremorComponents.tsx';
import { RiArrowLeftFill } from '@remixicon/react';

import { SimulatorFilterButtons } from '../components/SimulatorFilterButtons';
import { CombinationList } from '../components/CombinationList';
import { CombinationCard } from '../components/CombinationCard';
import Spinner from '../components/Spinner.tsx';

import { useAvailableRacesState } from '../hooks/useAvailableRacesState.ts';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';

const RaceList = lazy(() => import('../components/RaceList.tsx'));
const InformativeCard = lazy(() => import('../components/InformativeCard'));

export default function AvailableRaces() {
  const {
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
  } = useAvailableRacesState();

  if (loading) {
    return (
      <section className="p-8 min-h-screen">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="p-8 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        {selectedCombination && (
          <Button variant="secondary" onClick={resetSelection}>
            <RiArrowLeftFill />
            Volver
          </Button>
        )}
        <h2 className="font-heading text-3xl font-bold text-white text-center flex-1">
          CARRERAS DISPONIBLES
        </h2>
      </header>

      {!selectedCombination ? (
        <>
          <div className="flex justify-center mb-8 gap-3 flex-wrap">
            {simulatorsWithRaces.length === 0 ? (
              <p className="text-gray-500">No hay combinaciones vigentes.</p>
            ) : (
              <SimulatorFilterButtons
                selectedSimulator={selectedSimulator}
                setSelectedSimulator={setSelectedSimulator}
                simulatorsWithRaces={simulatorsWithRaces}
                setSelectedCombination={setSelectedCombination}
              />
            )}
          </div>

          <CombinationList
            combinations={filteredCombinations}
            setSelectedCombination={setSelectedCombination}
          />
        </>
      ) : (
        <ProtectedRoute>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-h-80">
            <InformativeCard
              selectedCombination={selectedCombination}
              nextRace={nextFiveRaces[0]}
              countdown={countdown}
            />
            <div className="lg:col-span-1">
              <CombinationCard
                combination={selectedCombination}
                nextRace={nextFiveRaces[0]}
              />
            </div>
            <div className="lg:col-span-3">
              <RaceList
                nextFiveRaces={nextFiveRaces}
                races={selectedCombination.races!}
              />
            </div>
          </div>
        </ProtectedRoute>
      )}
    </section>
  );
}

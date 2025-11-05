import { lazy, Suspense } from 'react'; // Import Suspense
import { Button } from '../../../components/tremor/TremorComponents.tsx';
import { RiArrowLeftFill } from '@remixicon/react';

import { SimulatorFilterButtons } from '../components/SimulatorFilterButtons.tsx';
import { CombinationList } from '../components/CombinationList.tsx';
import { CombinationCard } from '../components/CombinationCard.tsx';
import Spinner from '../../../components/Spinner.tsx';

import { useAvailableRacesState } from '../hooks/useAvailableRacesState.ts';
import { ProtectedRoute } from '../../../components/ProtectedRoute.tsx';

const RaceList = lazy(() => import('../components/RaceList.tsx'));
const InformativeCard = lazy(() => import('../components/InformativeCard.tsx'));

export default function AvailableRaces() {
  const {
    loading,
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
  } = useAvailableRacesState();

  if (loading) {
    return (
      <section className="p-8 min-h-screen">
        <Spinner>Cargando combinaciones...</Spinner>
      </section>
    );
  }

  const nextRace = nextRaces.length > 0 ? nextRaces[0] : null;

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
          <Suspense fallback={<Spinner>Cargando detalles...</Spinner>}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <InformativeCard
                selectedCombination={selectedCombination}
                nextRace={nextRace}
                countdown={countdown}
              />
              <div className="lg:col-span-1">
                <CombinationCard
                  combination={selectedCombination}
                  nextRace={nextRace}
                />
              </div>
              <div className="lg:col-span-3">
                <RaceList
                  nextRaces={nextRaces}
                  pastRaces={pastRaces}
                  isLoadingRaces={isLoadingRaces}
                />
              </div>
            </div>
          </Suspense>
        </ProtectedRoute>
      )}
    </section>
  );
}

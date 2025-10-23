import { useState, lazy, Suspense, useMemo } from 'react';
import { Combination, Simulator } from '../types/entities';
import { useCurrentRaces } from '../hooks/useCurrentRaces.ts';
import { getCategoryName } from '../utils/combination/getters.ts';

import { Card } from '../components/tremor/TremorComponents.tsx';
import { SimulatorFilterButtons } from '../components/SimulatorFilterButtons.tsx';
import { CombinationList } from '../components/CombinationList.tsx';
import { CombinationCard } from '../components/CombinationCard.tsx';
const ListRaces = lazy(() => import('../components/ListRaces.tsx'));

export default function AvailableRaces() {
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  const { allCombinations, simulatorsWithRaces } = useCurrentRaces(setLoading);

  // Filtrar combinaciones según simulador seleccionado
  const filteredCombinations = useMemo(() => {
    const combinations = selectedSimulator
      ? allCombinations.filter(
          (c) =>
            c.categoryVersion?.simulator?.id === selectedSimulator.id ||
            c.circuitVersion?.simulator?.id === selectedSimulator.id
        )
      : allCombinations;
    console.log('Rendering filteredCombinations');
    return combinations;
  }, [allCombinations, selectedSimulator]);

  return (
    <>
      <section className="p-8 min-h-screen">
        <h2 className="font-heading text-center text-3xl font-bold mb-8 text-white">
          CARRERAS DISPONIBLES
        </h2>

        {!selectedCombination && (
          <>
            <div className="flex justify-center mb-8 gap-3 flex-wrap">
              {loading ? (
                <p className="text-gray-500">Cargando simuladores...</p>
              ) : simulatorsWithRaces.length === 0 ? (
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
              loading={loading}
              setSelectedCombination={setSelectedCombination}
            />
          </>
        )}
        {/* List of races*/}
        {selectedCombination && (
          <>
            <Card>
              <div className="grid grid-rows-3 grid-flow-col gap-4 max-h-80">
                <div className="row-span-3 col-span-1">
                  <CombinationCard combination={selectedCombination} />
                </div>

                <h3 className="row-span-1 col-span-2 text-2xl font-bold text-gray-50 bg-gray-800 p-4">
                  Carreras Programadas para:{' '}
                  {getCategoryName(selectedCombination)}
                </h3>

                <div className="row-span-2 col-span-2 overflow-y-auto">
                  <Suspense fallback={<div>Cargando lista de carreras...</div>}>
                    <ListRaces combination={selectedCombination} />
                  </Suspense>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>
    </>
  );
}

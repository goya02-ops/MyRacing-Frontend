import { useState, lazy, Suspense } from 'react';
import { Combination, Simulator } from '../types/entities';
import { useCurrentRaces } from '../hooks/useCurrentRaces.ts';
import { getCategoryName } from '../utils/combination/getters.ts';

import { Button } from '../components/tremor/TremorComponents.tsx';
import { CombinationList } from '../components/CombinationList.tsx';
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
  const combinations = selectedSimulator
    ? allCombinations.filter(
        (c) =>
          c.categoryVersion?.simulator?.id === selectedSimulator.id ||
          c.circuitVersion?.simulator?.id === selectedSimulator.id
      )
    : allCombinations;

  return (
    <>
      <section className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-center text-3xl font-bold mb-8">
          CARRERAS DISPONIBLES
        </h2>

        {/*filter buttons*/}
        <div className="flex justify-center mb-8 gap-3 flex-wrap">
          {loading ? (
            <p className="text-gray-500">Cargando simuladores...</p>
          ) : simulatorsWithRaces.length === 0 ? (
            <p className="text-gray-500">No hay combinaciones vigentes.</p>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => setSelectedSimulator(null)}
              >
                Mostrar Todos
              </Button>
              {simulatorsWithRaces.map((sim) => (
                <Button
                  key={sim.id}
                  variant="primary"
                  onClick={() => setSelectedSimulator(sim)}
                >
                  {sim.name}
                </Button>
              ))}
            </>
          )}
        </div>

        <CombinationList
          combinations={combinations}
          loading={loading}
          setSelectedCombination={setSelectedCombination}
        />

        {/* List of races*/}
        {selectedCombination && (
          <div className="mt-12 pt-6 border-t border-gray-300">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Carreras Programadas para: {getCategoryName(selectedCombination)}
            </h3>
            <Suspense fallback={<div>Cargando lista de carreras...</div>}>
              <ListRaces combination={selectedCombination} />
            </Suspense>
          </div>
        )}
      </section>
    </>
  );
}

import { useState, useEffect, lazy } from 'react';
import { Combination, Simulator } from '../types/entities';
import { fetchCurrentRaces } from '../services/apiMyRacing.ts';
const ListRaces = lazy(() => import('../components/ListRaces.tsx'));

export default function AvailableRaces() {
  const [allCombinations, setAllCombinations] = useState<Combination[]>([]);
  const [simulatorsWithRaces, setSimulatorsWithRaces] = useState<Simulator[]>(
    []
  );
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentRaces()
      .then((combs) => {
        setAllCombinations(combs);

        // Derivar simuladores únicos con combinaciones vigentes
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
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrar combinaciones según simulador seleccionado
  const combinations = selectedSimulator
    ? allCombinations.filter(
        (c) =>
          c.categoryVersion?.simulator?.id === selectedSimulator.id ||
          c.circuitVersion?.simulator?.id === selectedSimulator.id
      )
    : [];

  return (
    <section>
      <h2>Carreras</h2>

      {loading ? (
        <p>Cargando simuladores...</p>
      ) : simulatorsWithRaces.length === 0 ? (
        <p>No hay simuladores con combinaciones vigentes.</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {simulatorsWithRaces.map((sim) => (
            <button
              key={sim.id}
              onClick={() => {
                setSelectedSimulator(sim);
                setSelectedCombination(null);
              }}
            >
              {sim.name}
            </button>
          ))}
        </div>
      )}

      {selectedSimulator && (
        <>
          {combinations.length === 0 ? (
            <p>No hay combinaciones disponibles para este simulador.</p>
          ) : (
            combinations.map((combination) => (
              <div key={combination.id}>
                <button onClick={() => setSelectedCombination(combination)}>
                  <h3>{combination.categoryVersion!.category!.denomination}</h3>
                  <h3>{combination.categoryVersion!.simulator!.name}</h3>
                  <h3>{combination.circuitVersion!.circuit!.denomination}</h3>
                  <p>
                    {combination.lapsNumber} vueltas |{' '}
                    {combination.obligatoryStopsQuantity} paradas
                  </p>
                </button>
              </div>
            ))
          )}
        </>
      )}

      {selectedCombination && <ListRaces combination={selectedCombination} />}
    </section>
  );
}

import { useState, useEffect, lazy } from 'react';
import { Combination, Simulator } from '../types/entities';
import { fetchCurrentRaces, fetchEntities } from '../services/apiMyRacing.ts';
const ListRaces = lazy(() => import('../components/ListRaces.tsx'));

export default function AvailableRaces() {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(
    null
  );
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [loadingSimulators, setLoadingSimulators] = useState(true);
  const [loadingCombinations, setLoadingCombinations] = useState(false);

  useEffect(() => {
    fetchEntities(Simulator)
      .then(setSimulators)
      .catch(console.error)
      .finally(() => setLoadingSimulators(false));
  }, []);

  useEffect(() => {
    if (selectedSimulator) {
      setLoadingCombinations(true);
      fetchCurrentRaces()
        .then((allCombinations) => {
          const filtered = allCombinations.filter(
            (c) =>
              c.categoryVersion?.simulator?.id === selectedSimulator.id ||
              c.circuitVersion?.simulator?.id === selectedSimulator.id
          );
          setCombinations(filtered);
        })
        .catch(console.error)
        .finally(() => setLoadingCombinations(false));
    } else {
      setCombinations([]);
      setSelectedCombination(null);
    }
  }, [selectedSimulator]);

  return (
    <section>
      <h2>Carreras</h2>

      {loadingSimulators ? (
        <p>Cargando simuladores...</p>
      ) : (
        <select
          value={selectedSimulator?.id ?? ''}
          onChange={(e) => {
            const sim = simulators.find((s) => s.id === Number(e.target.value));
            setSelectedSimulator(sim ?? null);
            setSelectedCombination(null);
          }}
        >
          <option value="">Seleccionar simulador</option>
          {simulators.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.name}
            </option>
          ))}
        </select>
      )}

      {selectedSimulator && (
        <>
          {loadingCombinations ? (
            <p>Cargando combinaciones...</p>
          ) : combinations.length === 0 ? (
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

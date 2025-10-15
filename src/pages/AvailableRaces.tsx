import { useState, useEffect } from 'react';
import { Combination } from '../types/entities';
import { fetchCurrentRaces } from '../services/service';
import { ListRaces } from '../components/ListRaces.tsx';

export default function AvailableRaces() {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedCombination, setSelectedCombination] =
    useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentRaces(Combination)
      .then(setCombinations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => console.log(selectedCombination), [selectedCombination]);

  if (loading) return <div>Cargando combinaciones...</div>;

  return (
    <section>
      <h2>Carreras por Combinación</h2>

      {combinations.length === 0 ? (
        <p>No hay carreras disponibles.</p>
      ) : (
        combinations.map((combination) => (
          <div key={combination.id}>
            <button onClick={() => setSelectedCombination(combination)}>
              <h3>{combination.categoryVersion!.category!.denomination}</h3>
              <h3>{combination.categoryVersion!.simulator!.name}</h3>
              <h3>{combination.circuitVersion!.circuit!.denomination}</h3>
              <p>
                {combination.lapsNumber} vueltas |
                {combination.obligatoryStopsQuantity} paradas
              </p>
            </button>
          </div>
        ))
      )}
    </section>
  );
}

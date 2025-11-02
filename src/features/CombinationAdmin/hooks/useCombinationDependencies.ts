import { useState, useEffect } from 'react';
import { Simulator, Category, Circuit } from '../../../types/entities.ts';
import { fetchEntities } from '../../../services/apiService.ts';

export function useCombinationDependencies() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sims, cats, circs] = await Promise.all([
          fetchEntities(Simulator),
          fetchEntities(Category),
          fetchEntities(Circuit),
        ]);

        // Guardamos solo los simuladores activos para los selectores
        setSimulators(sims.filter((s) => s.status === 'Activo') || []);
        setCategories(cats || []);
        setCircuits(circs || []);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
        setSimulators([]);
        setCategories([]);
        setCircuits([]);
      } finally {
        setLoadingDependencies(false);
      }
    };
    fetchData();
  }, []);

  return { simulators, categories, circuits, loadingDependencies };
}

import { useState, useEffect } from 'react';
import { fetchEntities } from '../../../services/apiService';
import { Category, Circuit, Simulator } from '../../../types/entities';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

export function useVersionDependencies(activeManager: ActiveManager) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchFormData = async () => {
      // Solo busca dependencias si un manager está abierto Y no las cargamos todavía
      const shouldFetch =
        activeManager.type !== null &&
        (categories.length === 0 || circuits.length === 0);
      if (!shouldFetch) return;

      setLoadingDependencies(true);
      try {
        // Usamos Promise.all para cargarlas en paralelo
        const [cats, circs] = await Promise.all([
          fetchEntities(Category),
          fetchEntities(Circuit),
        ]);
        if (cancelled) return;
        setCategories(cats || []);
        setCircuits(circs || []);
      } catch (error) {
        if (cancelled) return;
        console.error('Error fetching form data:', error);
      } finally {
        if (!cancelled) setLoadingDependencies(false);
      }
    };
    fetchFormData();
    return () => {
      cancelled = true;
    };
  }, [activeManager.type, categories.length, circuits.length]);

  return { categories, circuits, loadingDependencies };
}

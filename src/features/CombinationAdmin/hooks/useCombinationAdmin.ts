import { useEffect, useState } from 'react';
import {
  Combination,
  Simulator,
  Category,
  Circuit,
} from '../../../types/entities.ts';
import { fetchEntities } from '../../../services/apiService.ts';

// Interfaz para el valor de retorno del hook
interface UseCombinationAdminReturnType {
  list: Combination[];
  setList: React.Dispatch<React.SetStateAction<Combination[]>>;
  simulators: Simulator[] | null;
  categories: Category[] | null;
  circuits: Circuit[] | null;
  editing: Combination | null;
  setEditing: React.Dispatch<React.SetStateAction<Combination | null>>;
  loading: boolean;
}

export default function useCombinationAdmin(): UseCombinationAdminReturnType {
  const [list, setList] = useState<Combination[]>([]);
  const [simulators, setSimulators] = useState<Simulator[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [circuits, setCircuits] = useState<Circuit[] | null>(null);
  const [editing, setEditing] = useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga todas las dependencias al montar el hook
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carga de todas las listas en paralelo
        const [combos, sims, cats, circs] = await Promise.all([
          fetchEntities(Combination),
          fetchEntities(Simulator),
          fetchEntities(Category),
          fetchEntities(Circuit),
        ]);

        setList(combos);
        // Filtrar y guardar listas de dependencias
        setSimulators(sims.filter((s) => s.status === 'Activo'));
        setCategories(cats);
        setCircuits(circs);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Establecer a un array vacío en caso de fallo para desbloquear el renderizado
        setSimulators([]);
        setCategories([]);
        setCircuits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return {
    list,
    setList,
    editing,
    setEditing,
    simulators,
    categories,
    circuits,
    loading,
  };
}

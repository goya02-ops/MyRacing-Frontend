import { useEffect, useState } from 'react';
import { Combination, Simulator } from '../types/entities.ts';
import { fetchEntities } from '../services/apiService.ts';

interface useCombinationAdmin {
  list: Combination[];
  setList: React.Dispatch<React.SetStateAction<Combination[]>>;
  simulators: Simulator[] | null;
  editing: Combination | null;
  setEditing: React.Dispatch<React.SetStateAction<Combination | null>>;
  loading: boolean;
}

export default function useCombinationAdmin(): useCombinationAdmin {
  const [list, setList] = useState<Combination[]>([]);
  const [simulators, setSimulators] = useState<Simulator[] | null>(null);
  const [editing, setEditing] = useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargamos solo la lista de combinaciones al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEntities(Combination).then(setList).catch(console.error);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar SOLO simuladores cuando se va a editar/crear
  useEffect(() => {
    if (editing && !simulators) {
      const fetchData = async () => {
        try {
          const sims = await fetchEntities(Simulator);
          // Mostrar solo simuladores activos
          setSimulators(sims.filter((s) => s.status === 'Activo'));
        } catch (error) {
          console.error('Error fetching simulators:', error);
        }
      };
      fetchData();
    }
  }, [editing, simulators]);

  return {
    list,
    setList,
    editing,
    setEditing,
    simulators,
    loading,
  };
}

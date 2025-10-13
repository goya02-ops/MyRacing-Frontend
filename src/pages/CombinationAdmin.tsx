import { useEffect, lazy, useState } from 'react';
import { Combination, Simulator} from '../types/entities';
import { fetchEntities, saveEntity } from '../services/service';
const CombinationForm = lazy(
  () => import('../components/CombinationForm.tsx')
);

export default function CombinationAdmin() {
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

  // Acá validamos con una función, los duplicados
  const isDuplicate = (comb: Combination): boolean => {
    return list.some((item) => {
      const itemCategoryVersionId = typeof item.categoryVersion === 'object' ? item.categoryVersion.id : item.categoryVersion;
      const itemCircuitVersionId = typeof item.circuitVersion === 'object' ? item.circuitVersion.id : item.circuitVersion;
      const combCategoryVersionId = typeof comb.categoryVersion === 'object' ? comb.categoryVersion.id : comb.categoryVersion;
      const combCircuitVersionId = typeof comb.circuitVersion === 'object' ? comb.circuitVersion.id : comb.circuitVersion;

      return (
        itemCategoryVersionId === combCategoryVersionId &&
        itemCircuitVersionId === combCircuitVersionId &&
        item.dateFrom === comb.dateFrom &&
        item.dateTo === comb.dateTo &&
        item.id !== comb.id
      );
    });
  };

  function normalizeCombination(comb: Combination): Combination {
    return {
      ...comb,
      categoryVersion: typeof comb.categoryVersion === 'object' && comb.categoryVersion !== null 
        ? comb.categoryVersion.id! 
        : comb.categoryVersion,
      circuitVersion: typeof comb.circuitVersion === 'object' && comb.circuitVersion !== null 
        ? comb.circuitVersion.id! 
        : comb.circuitVersion,
    };
  }

  const handleSave = async (combination: Combination) => {
    const normalized = normalizeCombination(combination);

    // Verificar duplicado
    if (isDuplicate(normalized)) {
      alert('Esta combinación ya existe con las mismas fechas.');
      return;
    }

    try {
      const saved = await saveEntity(Combination, normalized);
      setList((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [...prev, saved]
      );
      setEditing(null);
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar la combinación');
    }
  };

  // Función auxiliar para obtener el nombre de la categoría
  const getCategoryName = (comb: Combination): string => {
    if (typeof comb.categoryVersion === 'object' && comb.categoryVersion) {
      const category = comb.categoryVersion.category;
      if (typeof category === 'object' && category) {
        return category.denomination || category.abbreviation || 'Sin nombre';
      }
    }
    return 'N/A';
  };

  // Función auxiliar para obtener el nombre del circuito
  const getCircuitName = (comb: Combination): string => {
    if (typeof comb.circuitVersion === 'object' && comb.circuitVersion) {
      const circuit = comb.circuitVersion.circuit;
      if (typeof circuit === 'object' && circuit) {
        return circuit.denomination || circuit.abbreviation || 'Sin nombre';
      }
    }
    return 'N/A';
  };

  // Función auxiliar para obtener el nombre del simulador
  const getSimulatorName = (comb: Combination): string => {
    if (typeof comb.categoryVersion === 'object' && comb.categoryVersion) {
      const simulator = comb.categoryVersion.simulator;
      if (typeof simulator === 'object' && simulator) {
        return simulator.name || 'Sin nombre';
      }
    }
    return 'N/A';
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <section>
      <h2>Administrar Combinaciones</h2>
      <button onClick={() => setEditing(new Combination())}>
        + Nueva Combinación
      </button>

      <table>
        <thead>
          <tr>
            <th>Simulador</th>
            <th>Categoría</th>
            <th>Circuito</th>
            <th>Fecha Desde</th>
            <th>Fecha Hasta</th>
            <th>Vueltas</th>
            <th>Paradas Obligatorias</th>
            <th>Intervalo (min)</th>
            <th>Tipo Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((comb) => (
            <tr key={comb.id}>
              <td>{getSimulatorName(comb)}</td>
              <td>{getCategoryName(comb)}</td>
              <td>{getCircuitName(comb)}</td>
              <td>{comb.dateFrom}</td>
              <td>{comb.dateTo}</td>
              <td>{comb.lapsNumber}</td>
              <td>{comb.obligatoryStopsQuantity}</td>
              <td>{comb.raceIntervalMinutes}</td>
              <td>{comb.userType}</td>
              <td>
                <button onClick={() => setEditing(comb)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && simulators && (
        <CombinationForm
          initial={editing}
          simulators={simulators}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}
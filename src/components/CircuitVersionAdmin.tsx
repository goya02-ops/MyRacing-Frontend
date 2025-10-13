import { lazy, useState, useEffect } from 'react';
import { CircuitVersion, Circuit, Simulator } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/service.ts';
const CircuitVersionForm = lazy(() => import('./CircuitVersionForm'));

export default function CircuitVersionAdmin() {
  const [list, setList] = useState<CircuitVersion[]>([]);
  const [editing, setEditing] = useState<CircuitVersion | null>(null);

  const [circuits, setCircuits] = useState<Circuit[] | null>(null);
  const [simulators, setSimulators] = useState<Simulator[] | null>(null);

  const [loading, setLoading] = useState(true);

  // Capturar versiones de los circuitos
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEntities(CircuitVersion).then(setList).catch(console.error);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Capturar circuitos y simuladores para el formulario
  useEffect(() => {
    //Solo cargar si se está editando y no se han cargado ya
    if (editing && !circuits && !simulators) {
      const fetchData = async () => {
        try {
          await fetchEntities(Circuit).then(setCircuits);
          const sims = await fetchEntities(Simulator);
          //Mostrar solo aquellos que estén activos
          setSimulators(sims.filter((s) => s.status === 'Activo'));
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [editing, circuits, simulators]);

  const isDuplicate = (cv: CircuitVersion): boolean => {
    return list.some((item) => {
      // Extraer IDs si son objetos
      const itemCircuitId =
        typeof item.circuit === 'object' ? item.circuit.id : item.circuit;
      const itemSimulatorId =
        typeof item.simulator === 'object' ? item.simulator.id : item.simulator;
      const cvCircuitId =
        typeof cv.circuit === 'object' ? cv.circuit.id : cv.circuit;
      const cvSimulatorId =
        typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator;

      return (
        itemCircuitId === cvCircuitId &&
        itemSimulatorId === cvSimulatorId &&
        item.id !== cv.id // Excluir el mismo registro si estamos editando
      );
    });
  };

  function normalizeCircuitVersion(cv: CircuitVersion): CircuitVersion {
    return {
      ...cv,
      circuit: typeof cv.circuit === 'object' ? cv.circuit.id! : cv.circuit,
      simulator:
        typeof cv.simulator === 'object' ? cv.simulator.id! : cv.simulator,
    };
  }

  const handleSave = async (circuitVersion: CircuitVersion) => {
    // Normalizar el objeto antes de guardar (asegurar que sean solo IDs)
    const normalized = normalizeCircuitVersion(circuitVersion);

    // Verificar duplicado
    if (isDuplicate(normalized)) {
      alert('Esta combinación de Circuito y Simulador ya existe.');
      return;
    }

    try {
      const saved = await saveEntity(CircuitVersion, normalized);
      setList((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [...prev, saved]
      );
      setEditing(null);
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar la versión de circuito');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <section>
      <h2>Administrar Versiones de Circuitos</h2>
      <button onClick={() => setEditing(new CircuitVersion())}>
        + Nueva Versión de Circuito
      </button>
      <table>
        <thead>
          <tr>
            <th>Circuito</th>
            <th>Simulador</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {list.map((cv) => (
            <tr key={cv.id}>
              <td>
                {typeof cv.circuit === 'object'
                  ? cv.circuit.denomination
                  : `ID ${cv.circuit}`}
              </td>
              <td>
                {typeof cv.simulator === 'object'
                  ? cv.simulator.name
                  : `ID ${cv.simulator}`}
              </td>
              <td>{cv.status}</td>
              <td>
                <button
                  onClick={() => {
                    setEditing(cv);
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && circuits && simulators && (
        <CircuitVersionForm
          initial={editing}
          circuits={circuits!}
          simulators={simulators!}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}

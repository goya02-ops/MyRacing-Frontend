import { lazy, useEffect, useState } from 'react';
import { Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
const CircuitForm = lazy(() => import('../components/CircuitForm'));

export default function CircuitAdmin() {
  const [list, setList] = useState<Circuit[]>([]);
  const [editing, setEditing] = useState<Circuit | null>(null);

  useEffect(() => {
    fetchEntities(Circuit).then(setList).catch(console.error);
  }, []);

  const handleSave = async (circuit: Circuit) => {
    const saved = await saveEntity(Circuit, circuit);
    setList((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
  };

  return (
    <section>
      <h2>Administrar Circuitos</h2>
      <button onClick={() => setEditing(new Circuit())}>
        + Nuevo Circuito
      </button>

      <table>
        <thead>
          <tr>
            <th>Denominación</th>
            <th>Abreviatura</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((circuit) => (
            <tr key={circuit.id}>
              <td>{circuit.denomination}</td>
              <td>{circuit.abbreviation}</td>
              <td>{circuit.description}</td>
              <td>
                <button onClick={() => setEditing(circuit)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <CircuitForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}

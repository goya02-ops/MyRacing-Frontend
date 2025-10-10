import { useState, useEffect } from 'react';
import SimulatorForm from './SimulatorForm.tsx';
import initialSimulatorsData from '../mocks/simulators.json';
import { type Simulator } from '../type';

// Lógica de gestión de lista integrada localmente (como habíamos acordado)
function UseIntegratedListManagement<T extends { id: number }>() {
  const [list, setList] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);

  const save = async (item: T) => {
    const isEditing = item.id !== 0 && item.id !== null && item.id !== undefined;

    if (isEditing) {
      setList((prev) => prev.map((el) => (el.id === item.id ? { ...item } : el)));
    } else {
      const newId = Date.now();
      setList((prev) => [...prev, { ...item, id: newId }]);
    }
    setEditing(null);
  };

  return { list, setList, editing, setEditing, save };
}

export default function SimulatorAdmin() {
  const {
    list: simulators,
    setList: setSimulators,
    editing,
    setEditing,
    save,
  } = UseIntegratedListManagement<Simulator>();

  useEffect(() => {
    setSimulators(initialSimulatorsData);
  }, []);

  return (
    <section>
      <h2>Administrar Simuladores</h2>
      <button
        onClick={() =>
          setEditing({ id: 0, name: '', status: '' })
        }
      >
        + Nuevo Simulador
      </button>

      <ul>
        {Array.isArray(simulators) && simulators.length > 0 ? (
          simulators.map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong> ({s.status})
              <button onClick={() => setEditing(s)}>Editar</button>
            </li>
          ))
        ) : (
          <li>No hay simuladores para mostrar.</li>
        )}
      </ul>

      {editing && (
        <SimulatorForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </section>
  );
}
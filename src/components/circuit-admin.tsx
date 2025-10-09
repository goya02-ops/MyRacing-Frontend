import { useEffect } from 'react';
import CircuitForm from './circuit-forms.tsx';
import { useUpdateList } from '../hooks/useUpdateList.ts';
import { fetchCircuits, saveCircuit } from '../services/circuit-service.ts';
import { type Circuit } from '../type';

export default function CircuitAdmin() {
  const {
    list: circuits,
    setList: setCircuit,
    editing,
    setEditing,
    save,
  } = useUpdateList<Circuit>(saveCircuit);

  useEffect(() => {
    fetchCircuits().then(setCircuit).catch(console.error);
  }, []);

  return (
    <section>
      <h2>Administrar Circuitos</h2>
      <button
        onClick={() =>
          setEditing({ id: 0, name: '', description: '', abbreviation: '' })
        }
      >
        + Nuevo Circuito
      </button>

      <ul>
        {Array.isArray(circuits) ? (
          circuits.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> ({c.abbreviation}) — {c.description}
              <button onClick={() => setEditing(c)}>Editar</button>
            </li>
          ))
        ) : (
          <li>Error: los datos no son una lista</li>
        )}
      </ul>

      {editing && (
        <CircuitForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </section>
  );
}

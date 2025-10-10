import { useEffect, useState } from 'react';
import { Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/service.ts';
import CircuitForm from './CircuitForm.tsx';

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

      <ul>
        {list.map((circuit) => (
          <li key={circuit.id}>
            <strong>{circuit.denomination}</strong> ({circuit.abbreviation}) —{' '}
            {circuit.description}
            <button onClick={() => setEditing(circuit)}>Editar</button>
          </li>
        ))}
      </ul>

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

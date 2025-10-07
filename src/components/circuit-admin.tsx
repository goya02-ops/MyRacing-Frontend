import { useState } from 'react';
import CircuitForm from './circuit-forms.tsx';
import { circuits as mockCircuits } from '../mocks/circuits.json';
import { type Circuit } from '../type';

export default function CircuitAdmin() {
  const [circuits, setCircuits] = useState<Circuit[]>(mockCircuits);
  const [editing, setEditing] = useState<Circuit | null>(null);

  const handleSave = (updated: Circuit) => {
    setCircuits((prev) =>
      prev.some((c) => c.id === updated.id)
        ? prev.map((c) => (c.id === updated.id ? updated : c))
        : [...prev, { ...updated, id: Date.now() }]
    );
    setEditing(null);
  };

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
        {circuits.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> ({c.abbreviation}) — {c.description}
            <button onClick={() => setEditing(c)}>Editar</button>
          </li>
        ))}
      </ul>

      {editing && (
        <CircuitForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

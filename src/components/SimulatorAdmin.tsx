import { useState, useEffect } from 'react';
import SimulatorForm from './SimulatorForm.tsx';
import { Simulator } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/service.ts';

export default function SimulatorAdmin() {
  const [list, setList] = useState<Simulator[]>([]);
  const [editing, setEditing] = useState<Simulator | null>(null);

  useEffect(() => {
    fetchEntities(Simulator).then(setList).catch(console.error);
  }, []);

  const handleSave = async (simulator: Simulator) => {
    const saved = await saveEntity(Simulator, simulator);
    setList((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
  };

  return (
    <section>
      <h2>Administrar Simuladores</h2>
      <button onClick={() => setEditing({ id: 0, name: '', status: '' })}>
        + Nuevo Simulador
      </button>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length > 0 ? (
            list.map((s) => (
              <tr key={s.id}>
                <th>{s.name}</th>
                <th>{s.status}</th>
                <th>
                  <button onClick={() => setEditing(s)}>Editar</button>
                </th>
              </tr>
            ))
          ) : (
            <li>No hay simuladores para mostrar.</li>
          )}
        </tbody>
      </table>

      {editing && (
        <SimulatorForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

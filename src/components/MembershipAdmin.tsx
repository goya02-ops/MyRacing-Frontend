import { lazy, useState, useEffect } from 'react';
import { Membership } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/service.ts';
const MembershipForm = lazy(() => import('./MembershipForm'));

export default function MembershipAdmin() {
  const [list, setList] = useState<Membership[]>([]);
  const [editing, setEditing] = useState<Membership | null>(null);

  useEffect(() => {
    fetchEntities(Membership).then(setList).catch(console.error);
  }, []);

  const handleSave = async (membership: Membership) => {
    const saved = await saveEntity(Membership, membership);
    setList((prev) =>
      prev.some((m) => m.id === saved.id)
        ? prev.map((m) => (m.id === saved.id ? saved : m))
        : [...prev, saved]
    );
    setEditing(null);
  };
  return (
    <section>
      <h2>Administrar Membresias</h2>
      <button onClick={() => setEditing(new Membership())}>
        + Nueva Membresia
      </button>

      <ul>
        {list.map((m) => (
          <li key={m.id}>
            <strong>{m.denomination}</strong>
            {m.price}
            <button onClick={() => setEditing(m)}>Editar</button>
          </li>
        ))}
      </ul>

      {editing && (
        <MembershipForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

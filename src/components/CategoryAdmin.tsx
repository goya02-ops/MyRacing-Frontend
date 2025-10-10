import { useState, useEffect } from 'react';
import { Category } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/service.ts';
import CategoryForm from './CategoryForm.tsx';

export default function CategoryAdmin() {
  const [list, setList] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    fetchEntities(Category).then(setList).catch(console.error);
  }, []);

  const handleSave = async (category: Category) => {
    const saved = await saveEntity(Category, category);
    setList((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
  };
  return (
    <section>
      <h2>Administrar Categorías</h2>
      <button
        onClick={() =>
          setEditing({
            id: 0,
            denomination: '',
            description: '',
            abbreviation: '',
          })
        }
      >
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
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.denomination}</td>
              <td>{c.abbreviation}</td>
              <td>{c.description}</td>
              <td>
                <button onClick={() => setEditing(c)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <CategoryForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

import { useState } from 'react';
import type { Category } from '../type';
import { categories } from '../mocks/categories.json';
import { useUpdateList } from '../hooks/useUpdateList.ts';

interface Props {
  initial: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

function CategoryForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Category>(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />
      <input
        name="abbreviation"
        value={form.abbreviation}
        onChange={handleChange}
        placeholder="Abreviación"
        required
      />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Descripción"
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}

export default function CategoryAdmin() {
  const { list, editing, setEditing, save } =
    useUpdateList<Category>(categories);

  return (
    <section>
      <h2>Administrar Categorías</h2>
      <button
        onClick={() =>
          setEditing({ id: 0, name: '', description: '', abbreviation: '' })
        }
      >
        + Nuevo Circuito
      </button>

      <ul>
        {list.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> ({c.abbreviation}) — {c.description}
            <button onClick={() => setEditing(c)}>Editar</button>
          </li>
        ))}
      </ul>

      {editing && (
        <CategoryForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </section>
  );
}

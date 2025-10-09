import { useState } from 'react';
import { Category } from '../types/entities.ts';

interface Props {
  initial: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryForm({ initial, onSave, onCancel }: Props) {
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

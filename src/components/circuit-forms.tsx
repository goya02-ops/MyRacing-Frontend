import { useState } from 'react';
import { type Circuit } from '../type';

interface Props {
  initial: Circuit;
  onSave: (circuit: Circuit) => void;
  onCancel: () => void;
}

export default function CircuitForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Circuit>(initial);

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

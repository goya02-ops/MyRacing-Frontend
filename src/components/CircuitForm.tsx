// components/CircuitForm.tsx
import { useEffect, useState } from 'react';
import { Circuit } from '../types/entities';

interface Props {
  initial: Circuit;
  onSave: (circuit: Circuit) => void;
  onCancel: () => void;
}

export default function CircuitForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Circuit>(initial);

  useEffect(() => {
    console.log('Estado actualizado:', form);
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Modificando:', name, '→', value);
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
        name="denomination"
        value={form.denomination}
        onChange={handleChange}
        placeholder="Denominación"
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

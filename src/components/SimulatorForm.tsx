import { useState } from 'react';
import { type Simulator } from '../type'; 

interface Props {
  initial: Simulator;
  onSave: (simulator: Simulator) => void;
  onCancel: () => void;
}

export default function SimulatorForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Simulator>(initial);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        required
      >
        <option value="">Selecciona un estado</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
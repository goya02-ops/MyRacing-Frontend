// src/components/CategoryVersionForm.tsx

import { useEffect, useState } from 'react';
import { CategoryVersion, Category, Simulator } from '../types/entities';

interface CategoryVersionFormProps {
  initial: CategoryVersion;
  categories: Category[];
  simulators: Simulator[];
  onSave: (categoryVersion: CategoryVersion) => void;
  onCancel: () => void;
}

export default function CategoryVersionForm({ 
  initial, 
  categories, 
  simulators, 
  onSave, 
  onCancel 
}: CategoryVersionFormProps) {
  const [form, setForm] = useState<CategoryVersion>(initial);

  useEffect(() => {
    console.log('Estado actualizado:', form);
  }, [form]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Modificando:', name, '→', value);
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === 'status' ? value : (value ? Number(value) : undefined)
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <label>
        Categoría (Circuito):
        <select
          name="category"
          value={typeof form.category === 'object' ? form.category.id : (form.category || '')}
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.denomination} ({cat.abbreviation})
            </option>
          ))}
        </select>
      </label>

      <label>
        Simulador:
        <select
          name="simulator"
          value={typeof form.simulator === 'object' ? form.simulator.id : (form.simulator || '')}
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione un simulador</option>
          {simulators.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Estado:
        <select
          name="status"
          value={form.status}
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione un estado</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </label>

      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
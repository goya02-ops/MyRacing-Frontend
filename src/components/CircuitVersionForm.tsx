import { useEffect, useState } from 'react';
import { CircuitVersion, Circuit, Simulator } from '../types/entities';

interface Props {
  initial: CircuitVersion;
  circuits: Circuit[];
  simulators: Simulator[];
  onSave: (circuitVersion: CircuitVersion) => void;
  onCancel: () => void;
}

export default function CircuitVersionForm({
  initial,
  circuits,
  simulators,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CircuitVersion>(initial);

  useEffect(() => {
    console.log('Estado actualizado:', form);
  }, [form]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Modificando:', name, '→', value);
    setForm((prev) => ({
      ...prev,
      [name]: name === 'status' ? value : value ? Number(value) : undefined,
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
        Circuito:
        <select
          name="circuito"
          value={
            typeof form.circuit === 'object'
              ? form.circuit.id
              : form.circuit || ''
          }
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione un circuito</option>
          {circuits.map((cir) => (
            <option key={cir.id} value={cir.id}>
              {cir.denomination} ({cir.abbreviation})
            </option>
          ))}
        </select>
      </label>

      <label>
        Simulador:
        <select
          name="simulator"
          value={
            typeof form.simulator === 'object'
              ? form.simulator.id
              : form.simulator || ''
          }
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

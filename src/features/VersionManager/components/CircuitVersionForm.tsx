import { useEffect, useState } from 'react';
import { CircuitVersion, Circuit, Simulator } from '../../../types/entities';
import {
  Button,
  Divider,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/tremor/TremorComponents';

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
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CircuitVersion>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'status' ? value : value ? Number(value) : undefined,
    }));
  };

  const handleSelectValueChange = (name: string, value: string) => {
    const event = {
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleSelectChange(event);
  };

  // Lógica de 'value' simplificada y más segura
  const getCircuitValue = () => {
    const circ = form.circuit;
    if (typeof circ === 'object' && circ !== null) {
      // Si es un objeto, usa su ID. Si el ID no existe (ej. es nuevo), usa ''
      return circ.id?.toString() || '';
    }
    // Si es un number, null o undefined, usa el valor o ''
    // (circ || '') maneja null/undefined.
    // El 'String()' convierte el número 123 a "123" sin error.
    return String(circ || '');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="circuit">Circuito</Label>
          <Select
            name="circuit"
            value={getCircuitValue()}
            onValueChange={(value) => handleSelectValueChange('circuit', value)}
            required
          >
            <SelectTrigger id="circuit">
              <SelectValue placeholder="Seleccione un circuito" />
            </SelectTrigger>
            <SelectContent>
              {circuits.map((cir) => (
                <SelectItem key={cir.id} value={String(cir.id)}>
                  {cir.denomination} ({cir.abbreviation})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="simulator">Simulador</Label>
          <Input
            id="simulator"
            name="simulator"
            value={
              typeof form.simulator === 'object' && form.simulator !== null
                ? form.simulator.name
                : ''
            }
            disabled
            readOnly
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            name="status"
            value={form.status}
            onValueChange={(value) => handleSelectValueChange('status', value)}
            required
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Divider className="pt-2" />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
}

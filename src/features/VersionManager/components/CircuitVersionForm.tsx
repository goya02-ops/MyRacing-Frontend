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
  isSaving?: boolean; 
}

export default function CircuitVersionForm({
  initial,
  circuits,
  onSave,
  onCancel,
  isSaving, 
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

  const getCircuitValue = () => {
    const circ = form.circuit;
    if (typeof circ === 'object' && circ !== null) {
      return circ.id?.toString() || '';
    }
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
            disabled={isSaving} 
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
            disabled={isSaving} 
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
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving} 
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving} 
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
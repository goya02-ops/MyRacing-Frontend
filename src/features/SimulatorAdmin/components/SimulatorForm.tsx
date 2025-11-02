import { useEffect, useState } from 'react';
import { Simulator } from '../../../types/entities.ts';
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
  initial: Simulator;
  onSave: (simulator: Simulator) => void;
  onCancel: () => void;
}

export default function SimulatorForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Simulator>(initial);

  useEffect(() => {
    // Sincroniza el formulario si el 'initial' prop cambia
    setForm(initial);
  }, [initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // Creamos un evento sintético para reutilizar el handleChange
    const event = {
      target: { name, value },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del simulador"
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            name="status"
            value={form.status}
            onValueChange={(value) => handleSelectChange('status', value)}
            required
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecciona un estado" />
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

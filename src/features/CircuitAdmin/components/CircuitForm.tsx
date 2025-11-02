import { useEffect, useState } from 'react';
import { Circuit } from '../../../types/entities';
import {
  Button,
  Divider,
  Input,
  Label,
} from '../../../components/tremor/TremorComponents';

interface Props {
  initial: Circuit;
  onSave: (circuit: Circuit) => void;
  onCancel: () => void;
}

export default function CircuitForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Circuit>(initial);

  useEffect(() => {
    // Sincroniza el formulario si el 'initial' prop cambia
    // (por ejemplo, al seleccionar otra entidad para editar)
    setForm(initial);
  }, [initial]);

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
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="denomination">Denominación</Label>
          <Input
            id="denomination"
            name="denomination"
            value={form.denomination}
            onChange={handleChange}
            placeholder="Ej: Autódromo Juan y Oscar Gálvez"
            required
          />
        </div>
        <div>
          <Label htmlFor="abbreviation">Abreviación</Label>
          <Input
            id="abbreviation"
            name="abbreviation"
            value={form.abbreviation}
            onChange={handleChange}
            placeholder="Ej: BA GP"
            required
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción (opcional)"
        />
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

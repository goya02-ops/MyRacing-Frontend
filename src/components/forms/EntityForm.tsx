import { useState, type ChangeEvent } from 'react';
import {
  Button,
  Divider,
  Input,
  Label,
} from '../tremor/TremorComponents';

export type EntityFormKind = 'category' | 'circuit';

export interface EntityFormValues {
  id?: number;
  denomination: string;
  abbreviation: string;
  description: string;
}

const KIND_PLACEHOLDERS: Record<
  EntityFormKind,
  { denomination: string; abbreviation: string }
> = {
  category: {
    denomination: 'Ej: Turismo Carretera',
    abbreviation: 'Ej: TC',
  },
  circuit: {
    denomination: 'Ej: Autódromo Juan y Oscar Gálvez',
    abbreviation: 'Ej: BA GP',
  },
};

interface Props {
  kind: EntityFormKind;
  initial: EntityFormValues;
  onSave: (entity: EntityFormValues) => void;
  onCancel: () => void;
}

export default function EntityForm({ kind, initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<EntityFormValues>(initial);
  const placeholders = KIND_PLACEHOLDERS[kind];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
            placeholder={placeholders.denomination}
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
            placeholder={placeholders.abbreviation}
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

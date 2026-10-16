import { useState } from 'react';
import {
  Category,
  CategoryVersion,
  Circuit,
  Simulator,
} from '../../types/entities';
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
} from '../tremor/TremorComponents';

export type EntityVersionKind = 'category' | 'circuit';

export type EntityVersionValues = Omit<CategoryVersion, 'category'> & {
  category?: Category | number;
  circuit?: Circuit | number;
};

const KIND_CONFIG: Record<
  EntityVersionKind,
  { label: string; placeholder: string }
> = {
  category: { label: 'Categoría', placeholder: 'Seleccione una categoría' },
  circuit: { label: 'Circuito', placeholder: 'Seleccione un circuito' },
};

interface Props {
  kind: EntityVersionKind;
  initial: EntityVersionValues;
  options: (Category | Circuit)[];
  onSave: (version: EntityVersionValues) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const optionId = (option: Category | Circuit) => String(option.id);

const linkId = (link: EntityVersionValues['category' | 'circuit']) =>
  typeof link === 'object' && link !== null
    ? link.id?.toString() || ''
    : String(link ?? '');

const simulatorName = (simulator?: Simulator) =>
  typeof simulator === 'object' && simulator !== null ? simulator.name : '';

export default function EntityVersionForm({
  kind,
  initial,
  options,
  onSave,
  onCancel,
  isSaving,
}: Props) {
  const [form, setForm] = useState<EntityVersionValues>(initial);
  const config = KIND_CONFIG[kind];

  const handleLinkChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      [kind]: value ? Number(value) : undefined,
    }));
  };

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
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
          <Label htmlFor={kind}>{config.label}</Label>
          <Select
            name={kind}
            value={linkId(form[kind])}
            onValueChange={handleLinkChange}
            required
            disabled={isSaving}
          >
            <SelectTrigger id={kind}>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={optionId(option)}>
                  {option.denomination} ({option.abbreviation})
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
            value={simulatorName(form.simulator)}
            disabled
            readOnly
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            name="status"
            value={form.status}
            onValueChange={handleStatusChange}
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
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { CategoryVersion, Category, Simulator } from '../../../types/entities';
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

interface CategoryVersionFormProps {
  initial: CategoryVersion;
  categories: Category[];
  simulators: Simulator[];
  onSave: (categoryVersion: CategoryVersion) => void;
  onCancel: () => void;
  isSaving?: boolean; 
}

export default function CategoryVersionForm({
  initial,
  categories,
  onSave,
  onCancel,
  isSaving, 
}: CategoryVersionFormProps) {
  const [form, setForm] = useState<CategoryVersion>(initial);

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

  const getCategoryValue = () => {
    const cat = form.category;
    if (typeof cat === 'object' && cat !== null) {
      return cat.id?.toString() || '';
    }
    return (cat || '').toString();
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
          <Label htmlFor="category">Categoría</Label>
          <Select
            name="category"
            value={getCategoryValue()}
            onValueChange={(value) =>
              handleSelectValueChange('category', value)
            }
            required
            disabled={isSaving} 
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id!.toString()}>
                  {cat.denomination} ({cat.abbreviation})
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
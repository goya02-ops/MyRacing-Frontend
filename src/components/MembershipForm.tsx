import { useEffect, useState } from 'react';
import { Membership } from '../types/entities.ts';
import {
  Button,
  Divider,
  Input,
  Label,
} from '../components/tremor/TremorComponents';

interface Props {
  initial: Membership;
  onSave: (membership: Membership) => void;
  onCancel: () => void;
}

export default function MembershipForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Membership>({
    ...initial,
    price: initial.price ?? '',
  });

  useEffect(() => {
    setForm({
      ...initial,
      price: initial.price ?? '',
    });
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const now = new Date();
        onSave({
          ...form,
          
          price: Number(form.price) || 0,
          dateFrom: now,
        });
      }}
      className="space-y-6"
    >
     
      <div>
        <Label htmlFor="price">Precio</Label>
        <Input
          id="price"
          name="price"
          type="number" // Tipo número para mejor UX
          value={form.price}
          onChange={handleChange}
          placeholder="Precio"
          required
          min="0"
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
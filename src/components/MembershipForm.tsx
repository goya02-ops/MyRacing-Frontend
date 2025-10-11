import { useState } from 'react';
import { Membership } from '../types/entities.ts';

interface Props {
  initial: Membership;
  onSave: (membership: Membership) => void;
  onCancel: () => void;
}

export default function MembershipForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Membership>(initial);

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
    >
      <input
        name="denomination"
        value={form.denomination}
        onChange={handleChange}
        placeholder="Denominación"
        required
      />
      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Precio"
        required
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}


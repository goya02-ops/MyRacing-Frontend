import { useState } from 'react';
import { User } from '../types/entities.ts';

interface Props {
  initial: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export default function UserForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<User>(initial);
  const [emailError, setEmailError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Validación de email en tiempo real
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(value) ? '' : 'Email inválido');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(form.email)) {
      setEmailError('Email inválido');
      return;
    }

    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="userName"
        value={form.userName}
        onChange={handleChange}
        placeholder="Nombre de usuario"
        required
      />
      <input
        name="realName"
        value={form.realName}
        onChange={handleChange}
        placeholder="Nombre real"
        required
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Contraseña"
        required
      />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="comun">Común</option>
        <option value="premium">Premium</option>
        <option value="admin">Administrador</option>
      </select>
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
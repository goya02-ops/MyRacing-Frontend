import { useState, useEffect } from 'react';
import { User } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/service';
import UserForm from '../components/UserForm';

export default function UserAdmin() {
  const [list, setList] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    fetchEntities(User).then(setList).catch(console.error);
  }, []);

  const handleSave = async (user: User) => {
    const saved = await saveEntity(User, user);
    setList((prev) =>
      prev.some((u) => u.id === saved.id)
        ? prev.map((u) => (u.id === saved.id ? saved : u))
        : [...prev, saved]
    );
    setEditing(null);
  };

  return (
    <section>
      <h2>Administrar Usuarios</h2>
      <button onClick={() => setEditing(new User())}>+ Nuevo Usuario</button>
      <ul>
        {list.map((user) => (
          <li key={user.id}>
            <strong>{user.userName}</strong> ({user.realName}) — {user.email} —{' '}
            {user.type}
            <button onClick={() => setEditing(user)}>Editar</button>
          </li>
        ))}
      </ul>

      {editing && (
        <UserForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

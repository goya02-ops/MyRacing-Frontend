import { useState } from 'react';
export function useUpdateList<T extends { id: number }>(
  persist?: (item: T) => Promise<T>
) {
  const [list, setList] = useState<T[]>([]); // ✅ array vacío por defecto
  const [editing, setEditing] = useState<T | null>(null);

  const save = async (item: T) => {
    const saved = persist ? await persist(item) : { ...item, id: Date.now() };
    setList((prev) =>
      prev.some((el) => el.id === saved.id)
        ? prev.map((el) => (el.id === saved.id ? saved : el))
        : [...prev, saved]
    );
    setEditing(null);
  };

  return { list, setList, editing, setEditing, save };
}

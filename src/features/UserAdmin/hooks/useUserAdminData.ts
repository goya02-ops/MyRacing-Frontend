import { useMemo } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { User } from '../../../types/entities';

interface UserAdminData {
  list: User[];
  loading: boolean;
}

/**
 * El listado de usuarios es solo lectura por ahora (la edición todavía no
 * existe), así que alcanza con la primitiva de datos.
 */
export function useUserAdminData(): UserAdminData {
  const { list: allUsers, isLoading: loading } = useEntityQuery(User);

  const list = useMemo(
    () => allUsers.filter((user) => user.type !== 'admin'),
    [allUsers],
  );

  return { list, loading };
}

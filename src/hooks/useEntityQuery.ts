import { useQuery } from '@tanstack/react-query';
import { fetchEntities } from '../services/apiService';
import type { Constructor } from '../types/entityMeta';

export function useEntityQuery<T>(cls: Constructor<T>) {
  const queryKey = [cls.name];

  const {
    data: list = [],
    isLoading,
    isError,
    error,
  } = useQuery<T[], Error>({
    queryKey: queryKey,
    queryFn: () => fetchEntities(cls),
  });

  return { list, isLoading, isError, error };
}

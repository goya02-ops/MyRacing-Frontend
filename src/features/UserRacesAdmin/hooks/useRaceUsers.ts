import { useState, useEffect } from 'react';
import { User } from '../../../types/entities';
import { fetchEntities } from '../../../services/apiService.ts';

import { fetchRaceUsersByUserId } from '../../../services/raceUserService';
import { RaceUser } from '../../../types/entities';

export const useRaceUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [raceUsers, setRaceUsers] = useState<RaceUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      try {
        const fetchedUsers: User[] = await fetchEntities(User);
        if (cancelled) return;
        const nonAdminUsers = fetchedUsers.filter((u) => u.type !== 'admin');
        setUsers(nonAdminUsers);
      } catch (error) {
        if (cancelled) return;
        console.error('Error al cargar usuarios:', error);
        setUsers([]);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    };
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Cargar carreras cuando se selecciona un usuario
  useEffect(() => {
    let cancelled = false;
    const loadRaces = async () => {
      if (!selectedUserId) {
        setRaceUsers([]);
        return;
      }
      setLoadingRaces(true);
      try {
        const data = await fetchRaceUsersByUserId(selectedUserId);
        if (cancelled) return;
        setRaceUsers(data as RaceUser[]);
      } catch (error) {
        if (cancelled) return;
        console.error('Error cargando carreras:', error);
        setRaceUsers([]);
      } finally {
        if (!cancelled) setLoadingRaces(false);
      }
    };
    void loadRaces();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId((prevId) => (prevId === userId ? null : userId));
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return {
    users,
    selectedUserId,
    raceUsers,
    loadingUsers,
    loadingRaces,
    handleUserSelect,
    selectedUser,
  };
};

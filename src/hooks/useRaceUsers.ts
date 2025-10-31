import { useState, useEffect } from 'react';
import { User } from '../types/entities'; 
import { fetchEntities } from '../services/apiService.ts';

import { fetchRaceUsersByUserId, type RaceUserResponse } from '../services/raceUserService'; 

export interface RaceUser extends RaceUserResponse {} 

export const useRaceUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [raceUsers, setRaceUsers] = useState<RaceUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);

  
  useEffect(() => {
   
    fetchEntities(User) 
      .then((fetchedUsers: User[]) => {
        const nonAdminUsers = fetchedUsers.filter((u) => u.type !== 'admin');
        setUsers(nonAdminUsers);
      })
      .catch((error) => {
        console.error('Error al cargar usuarios:', error);
        setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  // 2. Cargar carreras cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      setLoadingRaces(true);
      fetchRaceUsersByUserId(selectedUserId)
        .then((data) => {
          setRaceUsers(data as RaceUser[]);
        })
        .catch((error) => {
          console.error('Error cargando carreras:', error);
          setRaceUsers([]);
        })
        .finally(() => setLoadingRaces(false));
    } else {
      setRaceUsers([]);
    }
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
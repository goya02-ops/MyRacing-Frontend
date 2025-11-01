import { useState, useMemo } from 'react';
import { useRaceUsers } from '../hooks/useRaceUsers';
import type { RaceUser } from '../hooks/useRaceUsers';

export function useUserRacesPage() {
  const {
    users,
    selectedUserId,
    raceUsers,
    loadingUsers,
    loadingRaces,
    handleUserSelect,
    selectedUser,
  } = useRaceUsers();

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [minFinishPosition, setMinFinishPosition] = useState<number | ''>('');
  const [raceDateFrom, setRaceDateFrom] = useState('');

  const filteredRaceUsers = useMemo(() => {
    return raceUsers.filter((ru: RaceUser) => {
      let matchesPosition = true;
      let matchesDate = true;

      if (minFinishPosition !== '') {
        const minPos = Number(minFinishPosition);
        matchesPosition = ru.finishPosition > 0 && ru.finishPosition <= minPos;
      }

      if (raceDateFrom && ru.race?.raceDateTime) {
        const raceDate = new Date(ru.race.raceDateTime).getTime();
        const filterDate = new Date(raceDateFrom).getTime();
        matchesDate = raceDate >= filterDate;
      }

      return matchesPosition && matchesDate;
    });
  }, [raceUsers, minFinishPosition, raceDateFrom]);

  return {
    users,
    selectedUserId,
    raceUsers,
    loadingUsers,
    loadingRaces,
    handleUserSelect,
    selectedUser,
    userSearchTerm,
    setUserSearchTerm,
    minFinishPosition,
    setMinFinishPosition,
    raceDateFrom,
    setRaceDateFrom,
    filteredRaceUsers,
  };
}

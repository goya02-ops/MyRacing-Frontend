// hooks/useNextFiveRaces.ts
import { useEffect, useMemo, useState } from 'react';
import { Combination, Race } from '../types/entities';
import { fetchOne } from '../services/apiService.ts';

export function useNextFiveRaces(combination: Combination | null) {
  const [racesWithRacers, setRacesWithRacers] = useState<Race[]>([]);

  const nextFiveRaces = useMemo(() => {
    if (!combination?.races?.length) return [];
    const upcoming = combination.races.filter(
      (r) => new Date(r.registrationDeadline) > new Date()
    );
    return upcoming
      .sort(
        (a, b) =>
          new Date(a.registrationDeadline).getTime() -
          new Date(b.registrationDeadline).getTime()
      )
      .slice(0, 5); // 👈 solo las 5 primeras
  }, [combination]);

  useEffect(() => {
    let mounted = true;

    if (!nextFiveRaces.length) {
      setRacesWithRacers([]);
      return;
    }

    Promise.all(nextFiveRaces.map((race) => fetchOne(Race, race)))
      .then((results) => {
        if (mounted) {
          setRacesWithRacers(results.filter(Boolean) as Race[]);
        }
      })
      .catch((error) => {
        console.error('Error fetching races with racers', error);
      });

    return () => {
      mounted = false;
    };
  }, [nextFiveRaces]);

  return racesWithRacers;
}

import type { Combination } from '../types/entities.ts';

interface Props {
  combination: Combination;
}

export default function ListRaces({ combination }: Props) {
  const now = new Date();

  const upcomingRaces = combination!.races!.filter((race) => {
    const raceDate = new Date(race.raceDateTime);
    return raceDate > now;
  });

  return upcomingRaces.map((race: any) => (
    <div className="bg-slate-300" key={race.id}>
      <br />
      Fecha: {new Date(race.raceDateTime).toLocaleDateString()} | Hora:{' '}
      {new Date(race.raceDateTime).toLocaleTimeString()}
      Límite: {new Date(race.registrationDeadline).toLocaleDateString()}
      {new Date(race.raceDateTime).toLocaleTimeString()}
      <button disabled style={{ marginLeft: '10px', opacity: 0.5 }}>
        Inscribirse
      </button>
    </div>
  ));
}

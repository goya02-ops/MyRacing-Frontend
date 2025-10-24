import { RiCalendarEventFill, RiTimeLine, RiUserFill } from '@remixicon/react';
import { Button, Card, Divider } from './tremor/TremorComponents.tsx';
import { Race, User } from '../types/entities.ts';
import { useRaceInscription } from '../hooks/useRaceInscription';

type Props = {
  race: Race;
  user: User | null;
};

export function RaceListItem({ race, user }: Props) {
  const now = new Date();
  const isPast = new Date(race.raceDateTime) < now;
  const { loading, success, handleInscription } = useRaceInscription(
    user,
    race
  );

  return (
    <Card asChild key={race.id} className="border border-gray-800 bg-gray-900">
      <li>
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center space-x-1.5">
            <RiTimeLine className="size-5 text-gray-500" />
            <p className="text-sm text-gray-300">
              Cierre inscripción:{' '}
              {new Date(race.registrationDeadline).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <RiCalendarEventFill className="size-5 text-gray-500" />
            <p className="text-sm text-gray-300">
              Carrera: {new Date(race.raceDateTime).toLocaleString()}
            </p>
          </div>

          {!isPast && (
            <div className="flex items-center space-x-1.5">
              <RiUserFill className="size-5 text-gray-500" />
              <p className="text-sm text-gray-400">
                {race.raceUsers?.length} inscriptos
              </p>
            </div>
          )}
        </div>

        <Divider />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">ID: {race.id}</p>
          {isPast ? (
            <Button variant="secondary">Ver historial</Button>
          ) : (
            <Button onClick={handleInscription} disabled={loading || success}>
              {loading
                ? 'Inscribiendo...'
                : success
                ? 'Inscripto ✅'
                : 'Inscribirse'}
            </Button>
          )}
        </div>
      </li>
    </Card>
  );
}

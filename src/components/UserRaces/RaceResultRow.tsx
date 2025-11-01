import { Badge } from '../tremor/TremorComponents.tsx';
import { formatDateTime } from '../../utils/dateUtils.ts';
import { RaceUser } from '../../types/entities.ts';

interface RaceResultRowProps {
  raceUser: RaceUser;
}

export function RaceResultRow({ raceUser }: RaceResultRowProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50">
      <div className="flex-1 w-full md:w-auto mb-2 md:mb-0 font-medium">
        {formatDateTime(raceUser.registrationDateTime)} hs
      </div>
      <div className="flex-1 w-full md:w-auto mb-2 md:mb-0">
        {formatDateTime(raceUser.race?.raceDateTime)} hs
      </div>
      <div className="w-full md:w-24 flex justify-start md:justify-center mb-2 md:mb-0">
        <Badge variant="neutral">{raceUser.startPosition}</Badge>
      </div>
      <div className="w-full md:w-24 flex justify-start md:justify-center">
        <Badge variant="neutral">{raceUser.finishPosition}</Badge>
      </div>
    </div>
  );
}

import { Badge, Divider } from '../tremor/TremorComponents';
import { User, RaceUser } from '../../types/entities';
import RaceFilterPanel from './RaceFilterPanel';
import { RaceResultRow } from './RaceResultRow';

interface RaceResultsPanelProps {
  selectedUser: User | undefined;
  loadingRaces: boolean;
  raceUsers: RaceUser[]; // El total
  filteredRaceUsers: RaceUser[]; // Los filtrados
  minFinishPosition: number | '';
  setMinFinishPosition: (value: number | '') => void;
  raceDateFrom: string;
  setRaceDateFrom: (value: string) => void;
}

export function RaceResultsPanel({
  selectedUser,
  loadingRaces,
  raceUsers,
  filteredRaceUsers,
  minFinishPosition,
  setMinFinishPosition,
  raceDateFrom,
  setRaceDateFrom,
}: RaceResultsPanelProps) {
  // Vista de "Placeholder"
  if (!selectedUser) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 py-20">
          <span className="text-5xl mb-4">←</span>
          <span className="text-lg">
            Seleccione un usuario para ver sus carreras
          </span>
        </div>
      </div>
    );
  }

  // Vista de "Resultados"
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-orange-400">
            {selectedUser.realName}
          </h3>
          <p className="text-sm text-gray-400">@{selectedUser.userName}</p>
        </div>
        {!loadingRaces && (
          <Badge variant="neutral" className="text-base">
            Carreras visibles: {filteredRaceUsers.length} / {raceUsers.length}
          </Badge>
        )}
      </div>
      <Divider className="my-4" />

      <RaceFilterPanel
        minFinishPosition={minFinishPosition}
        setMinFinishPosition={setMinFinishPosition}
        raceDateFrom={raceDateFrom}
        setRaceDateFrom={setRaceDateFrom}
      />

      {loadingRaces && (
        <div className="text-center text-gray-400 py-10">
          Cargando carreras...
        </div>
      )}

      {!loadingRaces && filteredRaceUsers.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No hay carreras que coincidan con los filtros.
        </div>
      )}

      {!loadingRaces && filteredRaceUsers.length > 0 && (
        <div className="space-y-2">
          <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4 border-b border-gray-700/50">
            <div className="flex-1">Fecha de Inscripción</div>
            <div className="flex-1">Fecha de la Carrera</div>
            <div className="w-24 text-center">Largada</div>
            <div className="w-24 text-center">Llegada</div>
          </div>

          {filteredRaceUsers.map((ru) => (
            <RaceResultRow key={ru.id} raceUser={ru} />
          ))}
        </div>
      )}
    </div>
  );
}

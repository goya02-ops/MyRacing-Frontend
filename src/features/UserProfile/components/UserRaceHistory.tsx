import React from 'react';
import {
  Badge,
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '../../../components/tremor/TremorComponents.tsx';

interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: { raceDateTime: string } | any;
  user: any;
}

interface UserRaceHistoryProps {
  results: RaceUser[];
}

export const UserRaceHistory: React.FC<UserRaceHistoryProps> = ({
  results,
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Historial de Carreras 🏁</h3>
        <Badge color="gray">{results.length} carreras</Badge>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">
            Aún no tienes resultados de carreras registrados.
          </p>
          <p className="text-sm mt-2 opacity-70">
            ¡Inscríbete en tu primera carrera!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Fecha Registro</TableHeaderCell>
                <TableHeaderCell>Fecha Carrera</TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Pos. Salida
                </TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Pos. Final
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((ru) => (
                <TableRow key={ru.id}>
                  <TableCell>
                    {new Date(ru.registrationDateTime).toLocaleDateString(
                      'es-AR'
                    )}
                  </TableCell>
                  <TableCell>
                    {ru.race?.raceDateTime
                      ? new Date(ru.race.raceDateTime).toLocaleString('es-AR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {ru.startPosition}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">
                        {ru.finishPosition}
                      </span>
                      {ru.finishPosition === 1 && (
                        <span className="text-2xl">🥇</span>
                      )}
                      {ru.finishPosition === 2 && (
                        <span className="text-2xl">🥈</span>
                      )}
                      {ru.finishPosition === 3 && (
                        <span className="text-2xl">🥉</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

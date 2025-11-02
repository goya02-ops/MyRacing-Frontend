import { lazy, Suspense } from 'react';
import { Race } from '../../../types/entities';
import { useRaceAdmin } from '../hooks/useRaceAdmin';
import Spinner from '../../../components/Spinner';

import {
  Card,
  Button,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '../../../components/tremor/TremorComponents';

interface RaceWithId extends Race {
  id?: number;
}

const RaceForm = lazy(() => import('../components/RaceForm'));

export default function RaceAdmin() {
  const {
    list,
    combinations,
    editing,
    loading,
    handleSave,
    handleCancel,
    handleNew,
    handleEdit,
    getCombinationName,
  } = useRaceAdmin();

  if (loading) {
    return <Spinner>Cargando Carreras...</Spinner>;
  }

  return (
    <Card className="text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Administrar Carreras</h2>
        <Badge variant="neutral">Total: {list.length}</Badge>
      </div>

      <Button onClick={handleNew} className="w-full sm:w-auto mb-6">
        + Nueva Carrera
      </Button>

      {editing && (
        <Suspense fallback={<Spinner>Cargando formulario...</Spinner>}>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              {editing.id ? 'Editar' : 'Crear'} Carrera
            </h3>
            <RaceForm
              initial={editing}
              combinations={combinations}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Suspense>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Fecha/Hora Carrera</TableHeaderCell>
              <TableHeaderCell>Fecha Límite Insc.</TableHeaderCell>
              <TableHeaderCell>Combinación (Reglas)</TableHeaderCell>
              <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((race) => (
              <TableRow key={race.id}>
                <TableCell>{race.id}</TableCell>
                <TableCell>
                  {new Date(race.raceDateTime).toLocaleString('es-AR')}
                </TableCell>
                <TableCell>
                  {new Date(race.registrationDeadline).toLocaleString('es-AR')}
                </TableCell>
                <TableCell>
                  {getCombinationName((race as RaceWithId).combination)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleEdit(race as RaceWithId)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

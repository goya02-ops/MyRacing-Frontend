import { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeaderCell,
} from '../../../components/tremor/TremorComponents';
import { useSimulatorAdminContext } from '../../../context/SimulatorAdminContext.tsx';
import { SimulatorRow } from './SimulatorRow.tsx';

export function SimulatorList() {
  const { simulators } = useSimulatorAdminContext();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
            <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {simulators.map((s) => (
            <Suspense
              key={s.id}
              fallback={
                <TableRow>
                  <TableCell colSpan={3}>Cargando...</TableCell>
                </TableRow>
              }
            >
              <SimulatorRow simulator={s} />
            </Suspense>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

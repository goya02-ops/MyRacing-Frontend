import { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeaderCell,
} from '../../../components/tremor/TremorComponents';
import { Simulator } from '../../../types/entities';
import { SimulatorRow } from './SimulatorRow.tsx';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

interface SimulatorListProps {
  simulators: Simulator[];
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  activeManager: ActiveManager;
  onEdit: (sim: Simulator) => void;
  onCancel: () => void;
  onToggleManager: React.Dispatch<React.SetStateAction<ActiveManager>>;
}

export function SimulatorList({
  simulators,
  editingSimulator,
  isCreatingSimulator,
  activeManager,
  onEdit,
  onCancel,
  onToggleManager,
}: SimulatorListProps) {
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
              <SimulatorRow
                simulator={s}
                editingSimulator={editingSimulator}
                isCreatingSimulator={isCreatingSimulator}
                activeManager={activeManager}
                onEdit={onEdit}
                onCancel={onCancel}
                onToggleManager={onToggleManager}
              />
            </Suspense>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

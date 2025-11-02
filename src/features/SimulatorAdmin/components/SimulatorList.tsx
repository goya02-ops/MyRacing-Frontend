import { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeaderCell,
} from '../../../components/tremor/TremorComponents';
import { Simulator, Category, Circuit } from '../../../types/entities';
import { SimulatorRow } from './SimulatorRow.tsx';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};
type HandleSaveEntityBound = <T extends { id?: number }>(
  entityClass: new () => T,
  entity: T,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  onSuccess: () => void,
  duplicateCheck?: (entity: T) => boolean
) => Promise<void>;

interface SimulatorListProps {
  simulators: Simulator[];
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  activeManager: ActiveManager;
  categories: Category[];
  circuits: Circuit[];
  loadingDependencies: boolean;
  onEdit: (sim: Simulator) => void;
  onCancel: () => void;
  onToggleManager: React.Dispatch<React.SetStateAction<ActiveManager>>;
  handleSaveEntity: HandleSaveEntityBound;
}

export function SimulatorList({
  simulators,
  editingSimulator,
  isCreatingSimulator,
  activeManager,
  categories,
  circuits,
  loadingDependencies,
  onEdit,
  onCancel,
  onToggleManager,
  handleSaveEntity,
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
                categories={categories}
                circuits={circuits}
                loadingDependencies={loadingDependencies}
                onEdit={onEdit}
                onCancel={onCancel}
                onToggleManager={onToggleManager}
                handleSaveEntity={handleSaveEntity}
              />
            </Suspense>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

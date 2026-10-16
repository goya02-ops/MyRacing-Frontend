import { lazy, Suspense } from 'react';
import { Simulator } from '../../../types/entities';
import {
  TableRow,
  TableCell,
  Badge,
  Button,
} from '../../../components/tremor/TremorComponents';
import { useSimulatorAdminContext } from '../../../context/SimulatorAdminContext.tsx';

const VersionManager = lazy(() => import('../../../features/VersionManager'));

interface SimulatorRowProps {
  simulator: Simulator;
}

export function SimulatorRow({ simulator: s }: SimulatorRowProps) {
  const {
    editingSimulator,
    isCreatingSimulator,
    activeManager,
    handleEditSimulator,
    handleCancelSimulator,
    handleToggleManager,
  } = useSimulatorAdminContext();

  const isEditingThis = editingSimulator?.id === s.id && !isCreatingSimulator;
  const isManagerOpen =
    activeManager.simulator?.id === s.id && !editingSimulator;

  const isActiveCategory =
    activeManager.simulator?.id === s.id && activeManager.type === 'category';
  const isActiveCircuit =
    activeManager.simulator?.id === s.id && activeManager.type === 'circuit';

  return (
    <>
      <TableRow>
        <TableCell className="font-semibold">{s.name}</TableCell>
        <TableCell>
          <Badge variant={s.status === 'Activo' ? 'success' : 'error'}>
            {s.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant={isEditingThis ? 'primary' : 'ghost'}
              onClick={() =>
                isEditingThis ? handleCancelSimulator() : handleEditSimulator(s)
              }
            >
              {isEditingThis ? 'Cancelar' : 'Editar'}
            </Button>

            <Button
              variant={isActiveCategory ? 'primary' : 'ghost'}
              onClick={() => handleToggleManager(s, 'category')}
            >
              {isActiveCategory ? 'Ocultar' : 'Ver'} Cat.
            </Button>

            <Button
              variant={isActiveCircuit ? 'primary' : 'ghost'}
              onClick={() => handleToggleManager(s, 'circuit')}
            >
              {isActiveCircuit ? 'Ocultar' : 'Ver'} Circ.
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isManagerOpen && (
        <TableRow key={`${s.id}-manager`}>
          <TableCell colSpan={3} className="p-0">
            <Suspense
              fallback={
                <div className="p-4 text-center">Cargando Manager...</div>
              }
            >
              <VersionManager />
            </Suspense>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

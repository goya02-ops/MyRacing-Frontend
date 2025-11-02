import { lazy, Suspense } from 'react';
import { Simulator } from '../../../types/entities';
import {
  TableRow,
  TableCell,
  Badge,
  Button,
} from '../../../components/tremor/TremorComponents';

const VersionManager = lazy(() => import('../../../features/VersionManager'));

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

interface SimulatorRowProps {
  simulator: Simulator;
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  activeManager: ActiveManager;
  onEdit: (sim: Simulator) => void;
  onCancel: () => void;
  onToggleManager: React.Dispatch<React.SetStateAction<ActiveManager>>;
}

export function SimulatorRow({
  simulator: s,
  editingSimulator,
  isCreatingSimulator,
  activeManager,
  onEdit,
  onCancel,
  onToggleManager,
}: SimulatorRowProps) {
  const isEditingThis = editingSimulator?.id === s.id && !isCreatingSimulator;
  const isManagerOpen =
    activeManager.simulator?.id === s.id && !editingSimulator;

  const handleToggle = (type: 'category' | 'circuit') => {
    if (editingSimulator) onCancel();

    onToggleManager((prev) => {
      if (prev.simulator?.id === s.id && prev.type === type) {
        return { type: null, simulator: null };
      }
      return { type, simulator: s };
    });
  };

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
              onClick={() => (isEditingThis ? onCancel() : onEdit(s))}
            >
              {isEditingThis ? 'Cancelar' : 'Editar'}
            </Button>

            <Button
              variant={
                activeManager.simulator?.id === s.id &&
                activeManager.type === 'category'
                  ? 'primary'
                  : 'ghost'
              }
              onClick={() => handleToggle('category')}
            >
              {activeManager.simulator?.id === s.id &&
              activeManager.type === 'category'
                ? 'Ocultar'
                : 'Ver'}{' '}
              Cat.
            </Button>

            <Button
              variant={
                activeManager.simulator?.id === s.id &&
                activeManager.type === 'circuit'
                  ? 'primary'
                  : 'ghost'
              }
              onClick={() => handleToggle('circuit')}
            >
              {activeManager.simulator?.id === s.id &&
              activeManager.type === 'circuit'
                ? 'Ocultar'
                : 'Ver'}{' '}
              Circ.
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
              <VersionManager
                activeManager={activeManager}
                onClose={() => onToggleManager({ type: null, simulator: null })}
              />
            </Suspense>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

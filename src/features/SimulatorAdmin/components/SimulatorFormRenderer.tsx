import { lazy, Suspense } from 'react';
import { Divider } from '../../../components/tremor/TremorComponents';
import { Simulator } from '../../../types/entities';

const SimulatorForm = lazy(() => import('../../../components/SimulatorForm'));

interface FormRendererProps {
  formRef: React.RefObject<HTMLDivElement | null>;
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  onSave: (sim: Simulator) => void;
  onCancel: () => void;
}

export function SimulatorFormRenderer({
  formRef,
  editingSimulator,
  isCreatingSimulator,
  onSave,
  onCancel,
}: FormRendererProps) {
  if (!editingSimulator) return null;

  return (
    <div ref={formRef as React.RefObject<HTMLDivElement>}>
      <div className="mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-orange-400">
            {isCreatingSimulator
              ? 'Crear Nuevo'
              : `Editar Simulador: ${editingSimulator?.name}`}
          </h3>
          <Suspense
            fallback={<div className="text-center p-4">Cargando...</div>}
          >
            <SimulatorForm
              initial={editingSimulator}
              onCancel={onCancel}
              onSave={onSave}
            />
          </Suspense>
        </div>
        <Divider className="my-6" />
      </div>
    </div>
  );
}

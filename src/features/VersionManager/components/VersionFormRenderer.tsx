import { lazy, Suspense } from 'react';
import { Divider } from '../../../components/tremor/TremorComponents';
import {
  Simulator,
  Category,
  Circuit,
  CategoryVersion,
  CircuitVersion,
} from '../../../types/entities';

const CategoryVersionForm = lazy(() => import('./CategoryVersionForm'));
const CircuitVersionForm = lazy(() => import('./CircuitVersionForm'));


interface VersionFormRendererProps {
  editingVersion: CategoryVersion | CircuitVersion | null;
  isCreatingVersion: boolean;
  isCategory: boolean;
  activeManager: { simulator: Simulator | null };
  categories: Category[];
  circuits: Circuit[];
  onSaveCategoryVersion: (v: CategoryVersion) => void;
  onSaveCircuitVersion: (v: CircuitVersion) => void;
  handleCancelVersion: () => void;
  isSaving?: boolean; 
}

export function VersionFormRenderer({
  editingVersion,
  isCreatingVersion,
  isCategory,
  activeManager,
  categories,
  circuits,
  onSaveCategoryVersion,
  onSaveCircuitVersion,
  handleCancelVersion,
  isSaving, 
}: VersionFormRendererProps) {
  if (!editingVersion) return null;

  return (
    <div className="mb-4">
      <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-md font-semibold mb-3 text-orange-400">
            {isCreatingVersion ? 'Crear' : 'Editar'} Versión
          </h4>
          {isCategory ? (
            <CategoryVersionForm
              initial={editingVersion as CategoryVersion}
              categories={categories}
              simulators={[activeManager.simulator!]}
              onSave={onSaveCategoryVersion}
              onCancel={handleCancelVersion}
              isSaving={isSaving} 
            />
          ) : (
            <CircuitVersionForm
              initial={editingVersion as CircuitVersion}
              circuits={circuits}
              simulators={[activeManager.simulator!]}
              onSave={onSaveCircuitVersion}
              onCancel={handleCancelVersion}
              isSaving={isSaving} 
            />
          )}
        </div>
        <Divider className="my-4" />
      </Suspense>
    </div>
  );
}
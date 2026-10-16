import { lazy, Suspense } from 'react';
import { Divider } from '../../../components/tremor/TremorComponents';
import {
  Category,
  Circuit,
  CategoryVersion,
  CircuitVersion,
} from '../../../types/entities';

import type { EntityVersionValues } from '../../../components/forms/EntityVersionForm';

const EntityVersionForm = lazy(
  () => import('../../../components/forms/EntityVersionForm')
);

interface VersionFormRendererProps {
  editingVersion: CategoryVersion | CircuitVersion | null;
  isCreatingVersion: boolean;
  isCategory: boolean;
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
  categories,
  circuits,
  onSaveCategoryVersion,
  onSaveCircuitVersion,
  handleCancelVersion,
  isSaving,
}: VersionFormRendererProps) {
  if (!editingVersion) return null;

  const handleSave = (version: EntityVersionValues) => {
    if (isCategory) {
      onSaveCategoryVersion(version as CategoryVersion);
    } else {
      onSaveCircuitVersion(version as CircuitVersion);
    }
  };

  return (
    <div className="mb-4">
      <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-md font-semibold mb-3 text-orange-400">
            {isCreatingVersion ? 'Crear' : 'Editar'} Versión
          </h4>
          <EntityVersionForm
            key={editingVersion.id ?? 'new'}
            kind={isCategory ? 'category' : 'circuit'}
            initial={editingVersion}
            options={isCategory ? categories : circuits}
            onSave={handleSave}
            onCancel={handleCancelVersion}
            isSaving={isSaving}
          />
        </div>
        <Divider className="my-4" />
      </Suspense>
    </div>
  );
}

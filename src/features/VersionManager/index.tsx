import { Simulator, Category, Circuit } from '../../types/entities';
import { Button, Divider } from '../../components/tremor/TremorComponents';

// Importamos los sub-componentes
import { VersionHeader } from './components/VersionHeader';
import { VersionFormRenderer } from './components/VersionFormRenderer';
import { VersionList } from './components/VersionList';
import { useVersionManagerLogic } from './hooks/useVersionManagerLogic';

// Tipos (sin cambios)
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

interface VersionManagerProps {
  activeManager: ActiveManager;
  categories: Category[];
  circuits: Circuit[];
  handleSaveEntity: HandleSaveEntityBound;
  onClose: () => void;
}

export default function VersionManager({
  activeManager,
  categories,
  circuits,
  handleSaveEntity,
  onClose,
}: VersionManagerProps) {
  const hookProps = useVersionManagerLogic(activeManager, handleSaveEntity);

  if (!activeManager.simulator) return null;

  return (
    <div className="bg-gray-900/50 p-4">
      <VersionHeader
        title={hookProps.title}
        simulatorName={activeManager.simulator.name}
        onNewVersion={hookProps.handleNewVersion}
      />

      <VersionFormRenderer
        {...hookProps}
        activeManager={activeManager}
        categories={categories}
        circuits={circuits}
      />

      <VersionList
        isCategory={hookProps.isCategory}
        versions={
          hookProps.isCategory
            ? hookProps.categoryVersions
            : hookProps.circuitVersions
        }
        editingVersion={hookProps.editingVersion}
        isCreatingVersion={hookProps.isCreatingVersion}
        handleEditVersion={hookProps.handleEditVersion}
        handleCancelVersion={hookProps.handleCancelVersion}
      />

      <Divider className="my-4" />
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}

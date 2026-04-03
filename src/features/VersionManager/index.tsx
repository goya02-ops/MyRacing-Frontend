import { Simulator } from '../../types/entities';
import { Button, Divider } from '../../components/tremor/TremorComponents';
import { VersionHeader } from './components/VersionHeader';
import { VersionFormRenderer } from './components/VersionFormRenderer';
import { VersionList } from './components/VersionList';
import { useVersionManagerLogic } from './hooks/useVersionManagerLogic'; 
import { useVersionDependencies } from '../SimulatorAdmin/hooks/useVersionDependencies';
import Spinner from '../../components/Spinner';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

interface VersionManagerProps {
  activeManager: ActiveManager;
  onClose: () => void;
}

export default function VersionManager({
  activeManager,
  onClose,
}: VersionManagerProps) {


  const { categories, circuits, loadingDependencies } =
    useVersionDependencies(activeManager);

  const hookProps = useVersionManagerLogic(activeManager);

  if (!activeManager.simulator) return null;

  return (
    <div className="bg-gray-900/50 p-4">
      <VersionHeader
        title={hookProps.title}
        simulatorName={activeManager.simulator.name}
        onNewVersion={hookProps.handleNewVersion}
      />

      {loadingDependencies ? (
        <div className="flex justify-center p-4">
          <Spinner>Cargando dependencias...</Spinner>
        </div>
      ) : (
        <VersionFormRenderer
          {...hookProps}
          activeManager={activeManager}
          categories={categories}
          circuits={circuits}
          isSaving={hookProps.isSaving} 
        />
      )}


      {hookProps.loading ? ( // <-- ¡NUEVO!
        <div className="flex justify-center p-4">
          <Spinner>Cargando versiones...</Spinner>
        </div>
      ) : (
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
      )}

      <Divider className="my-4" />
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
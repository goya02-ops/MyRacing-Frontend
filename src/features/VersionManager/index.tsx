import { Button, Divider } from '../../components/tremor/TremorComponents';
import { VersionHeader } from './components/VersionHeader';
import { VersionFormRenderer } from './components/VersionFormRenderer';
import { VersionList } from './components/VersionList';
import { useVersionManagerLogic } from './hooks/useVersionManagerLogic';
import { useVersionDependencies } from '../SimulatorAdmin/hooks/useVersionDependencies';
import { useSimulatorAdminContext } from '../../context/SimulatorAdminContext.tsx';
import Spinner from '../../components/Spinner';

export default function VersionManager() {
  const { activeManager, handleCloseManager } = useSimulatorAdminContext();

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
          editingVersion={hookProps.editingVersion}
          isCreatingVersion={hookProps.isCreatingVersion}
          isCategory={hookProps.isCategory}
          categories={categories}
          circuits={circuits}
          onSaveCategoryVersion={hookProps.onSaveCategoryVersion}
          onSaveCircuitVersion={hookProps.onSaveCircuitVersion}
          handleCancelVersion={hookProps.handleCancelVersion}
          isSaving={hookProps.isSaving}
        />
      )}

      {hookProps.loading ? (
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
        <Button variant="secondary" onClick={handleCloseManager}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}

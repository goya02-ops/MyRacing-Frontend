import { Simulator } from '../../types/entities';
import { Button, Divider } from '../../components/tremor/TremorComponents';

import { VersionHeader } from './components/VersionHeader';
import { VersionFormRenderer } from './components/VersionFormRenderer';
import { VersionList } from './components/VersionList';

import { useVersionManagerLogic } from './hooks/useVersionManagerLogic';

import { useSimulatorAdminContext } from '../../context/SimulatorAdminContext';

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
  const { categories, circuits, handleSaveEntity } = useSimulatorAdminContext();

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

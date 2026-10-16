import { useCallback, useMemo, useState } from 'react';
import { useScrollToElement } from '../../../hooks/useScrollToElement';
import { Simulator } from '../../../types/entities';
import { Card } from '../../../components/tremor/TremorComponents';

import { useSimulatorAdmin } from '../hooks/useSimulatorAdmin.ts';
import { AdminHeader } from '../components/AdminHeader';
import { SimulatorFormRenderer } from '../components/SimulatorFormRenderer';
import { SimulatorList } from '../components/SimulatorList';

import Spinner from '../../../components/Spinner.tsx';
import {
  SimulatorAdminProvider,
  type ActiveManager,
  type ActiveManagerType,
} from '../../../context/SimulatorAdminContext.tsx';

export default function SimulatorAdmin() {
  const [activeManager, setActiveManager] = useState<ActiveManager>({
    type: null,
    simulator: null,
  });

  const {
    simulators,
    editingSimulator,
    isCreatingSimulator,
    loadingSimulators,
    isSaving,
    handleNewSimulator,
    handleEditSimulator,
    handleCancelSimulator,
    handleSaveSimulator,
  } = useSimulatorAdmin();

  const formContainerRef = useScrollToElement<HTMLDivElement>(editingSimulator);

  const handleToggleManager = useCallback(
    (simulator: Simulator, type: ActiveManagerType) => {
      if (editingSimulator) handleCancelSimulator();

      setActiveManager((prev) => {
        if (prev.simulator?.id === simulator.id && prev.type === type) {
          return { type: null, simulator: null };
        }
        return { type, simulator };
      });
    },
    [editingSimulator, handleCancelSimulator]
  );

  const handleCloseManager = useCallback(() => {
    setActiveManager({ type: null, simulator: null });
  }, []);

  const contextValue = useMemo(
    () => ({
      simulators,
      editingSimulator,
      isCreatingSimulator,
      activeManager,
      handleEditSimulator,
      handleCancelSimulator,
      handleToggleManager,
      handleCloseManager,
    }),
    [
      simulators,
      editingSimulator,
      isCreatingSimulator,
      activeManager,
      handleEditSimulator,
      handleCancelSimulator,
      handleToggleManager,
      handleCloseManager,
    ]
  );

  if (loadingSimulators) {
    return <Spinner>Cargando simuladores...</Spinner>;
  }

  return (
    <SimulatorAdminProvider value={contextValue}>
      <Card className="text-gray-200">
        <AdminHeader
          listLength={simulators.length}
          onNew={handleNewSimulator}
        />
        <SimulatorFormRenderer
          formRef={formContainerRef}
          editingSimulator={editingSimulator}
          isCreatingSimulator={isCreatingSimulator}
          onCancel={handleCancelSimulator}
          onSave={handleSaveSimulator}
          isSaving={isSaving}
        />
        <SimulatorList />
      </Card>
    </SimulatorAdminProvider>
  );
}

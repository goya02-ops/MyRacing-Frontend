import { useState, useCallback } from 'react';
import { useScrollToElement } from '../../../hooks/useScrollToElement';
import { Simulator } from '../../../types/entities';
import { handleSaveEntity as genericHandleSaveEntity } from '../../../utils/GlobalHandlers';
import { Card } from '../../../components/tremor/TremorComponents';

import { useSimulatorCRUD } from '../hooks/useSimulatorCRUD.ts';

import { SimulatorAdminProvider } from '../../../context/SimulatorAdminContext.tsx';

import { AdminHeader } from '../components/AdminHeader';
import { SimulatorFormRenderer } from '../components/SimulatorFormRenderer';
import { SimulatorList } from '../components/SimulatorList';
import Spinner from '../../../components/Spinner.tsx';

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

export default function SimulatorAdmin() {
  const [activeManager, setActiveManager] = useState<ActiveManager>({
    type: null,
    simulator: null,
  });

  const {
    simulators,
    editingSimulator,
    isCreatingSimulator,
    loading,
    handleNewSimulator,
    handleEditSimulator,
    handleCancelSimulator,
    handleSaveSimulator,
  } = useSimulatorCRUD();

  const handleSaveEntity = useCallback(
    <T extends { id?: number }>(
      entityClass: new () => T,
      entity: T,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      onSuccess: () => void,
      duplicateCheck?: (entity: T) => boolean
    ): Promise<void> => {
      return genericHandleSaveEntity(
        entityClass,
        entity,
        setter,
        onSuccess,
        duplicateCheck
      );
    },
    [simulators]
  );

  const formContainerRef = useScrollToElement<HTMLDivElement>(editingSimulator);

  if (loading) {
    return <Spinner>Cargando simuladores...</Spinner>;
  }

  return (
    <SimulatorAdminProvider value={{ handleSaveEntity }}>
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
        />

        <SimulatorList
          simulators={simulators}
          editingSimulator={editingSimulator}
          isCreatingSimulator={isCreatingSimulator}
          activeManager={activeManager}
          onEdit={handleEditSimulator}
          onCancel={handleCancelSimulator}
          onToggleManager={setActiveManager}
        />
      </Card>
    </SimulatorAdminProvider>
  );
}

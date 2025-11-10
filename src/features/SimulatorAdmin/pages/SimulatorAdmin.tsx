import { useState } from 'react';
import { useScrollToElement } from '../../../hooks/useScrollToElement';
import { Simulator } from '../../../types/entities';
import { Card } from '../../../components/tremor/TremorComponents';


import { useSimulatorAdmin } from '../hooks/useSimulatorAdmin.ts';
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
    loadingSimulators, 
    isSaving,          
    handleNewSimulator,
    handleEditSimulator,
    handleCancelSimulator,
    handleSaveSimulator,
  } = useSimulatorAdmin();

  const formContainerRef = useScrollToElement<HTMLDivElement>(editingSimulator);

  
  if (loadingSimulators) {
    return <Spinner>Cargando simuladores...</Spinner>;
  }

  
  return (
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
  );
}
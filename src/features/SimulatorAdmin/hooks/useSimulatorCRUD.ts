import { useAdminCRUD } from '../../../hooks/useAdminCRUD';
import { Simulator } from '../../../types/entities';

export function useSimulatorCRUD() {
  const crud = useAdminCRUD(Simulator);

  return {
    simulators: crud.list,
    setSimulators: crud.setList,
    editingSimulator: crud.editing,
    isCreatingSimulator: crud.isCreating,
    loading: crud.loading,
    handleNewSimulator: crud.handleNew,
    handleEditSimulator: crud.handleEdit,
    handleCancelSimulator: crud.handleCancel,
    handleSaveSimulator: crud.handleSave,
  };
}

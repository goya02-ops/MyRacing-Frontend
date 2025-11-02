import { useAdminCRUD } from '../../../hooks/useAdminCRUD';
import { Circuit } from '../../../types/entities';

export function useCircuitAdmin() {
  const crud = useAdminCRUD(Circuit);

  return {
    ...crud,
    handleNewCircuit: crud.handleNew,
    handleEditCircuit: crud.handleEdit,
  };
}

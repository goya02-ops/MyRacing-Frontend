import { Combination } from '../../../types/entities.ts';
import { useAdminCRUD } from '../../../hooks/useAdminCRUD.ts';

interface CombinationWithId extends Combination {
  id?: number;
}

export function useCombinationAdmin() {
  const crud = useAdminCRUD(Combination as new () => CombinationWithId);

  return {
    list: crud.list,
    setList: crud.setList,
    editing: crud.editing,
    setEditing: crud.setEditing,
    loading: crud.loading,
    handleSave: crud.handleSave,
    handleCancel: crud.handleCancel,
    handleNew: crud.handleNew,
    handleEdit: crud.handleEdit,
  };
}

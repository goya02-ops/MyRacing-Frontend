import { useAdminCRUD } from '../../../hooks/useAdminCRUD';
import { Category } from '../../../types/entities';

export function useCategoryAdmin() {
  const crud = useAdminCRUD(Category);

  return {
    ...crud,
    handleNewCategory: crud.handleNew,
    handleEditCategory: crud.handleEdit,
  };
}

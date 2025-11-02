import { useMemo } from 'react';
import { useAdminCRUD } from '../../../hooks/useAdminCRUD';
import { User } from '../../../types/entities';

export function useUserAdmin() {
  const crud = useAdminCRUD(User);

  const filteredList = useMemo(() => {
    return crud.list.filter((u) => u.type !== 'admin');
  }, [crud.list]);

  return {
    list: filteredList,
    loading: crud.loading,
    handleSave: crud.handleSave,
    handleCancel: crud.handleCancel,
    handleNew: crud.handleNew,
    handleEdit: crud.handleEdit,
  };
}

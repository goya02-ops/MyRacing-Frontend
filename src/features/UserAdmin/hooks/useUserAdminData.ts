import { useMemo, useCallback } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts'; 
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts'; 
import { User } from '../../../types/entities';

interface UserAdminLogic {
  list: User[];
  loading: boolean;
  isSaving: boolean;
  handleSave: (user: User) => Promise<void>;
  handleCancel: () => void;
  handleNew: () => void;
  handleEdit: (user: User) => void;
}

export function useUserAdminData(): UserAdminLogic {
  const { list: allUsers, isLoading } = useEntityQuery(User as any);
  
  const { saveEntity: mutateSave, isSaving } = useEntityMutation(User as any);

  const filteredList = useMemo(() => {
    return (allUsers as User[]).filter((u) => u.type !== 'admin');
  }, [allUsers]);

  const handleSave = useCallback(async (user: User) => {
    try {
      await mutateSave(user);
    } catch (error) {
      console.error('Save error:', error);
      alert('Error al guardar el usuario.');
    }
  }, [mutateSave]);
  
  const handleCancel = useCallback(() => {}, []);
  const handleNew = useCallback(() => { /* Lógica para abrir formulario */ }, []);
  const handleEdit = useCallback((_user: User) => { 
    console.log('Implementación futura para editar:', _user);
    }, []);

  return {
    list: filteredList,
    loading: isLoading,
    isSaving,
    handleSave,
    handleCancel,
    handleNew,
    handleEdit,
  };
}
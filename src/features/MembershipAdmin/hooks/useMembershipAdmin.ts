import { useState, useCallback, useMemo } from 'react';
import { Membership } from '../../../types/entities.ts';
import { useEntityCRUD } from '../../../hooks/useEntityCRUD.ts';

interface MembershipAdminLogic {
  memberships: Membership[];
  editing: Membership | null;
  loading: boolean;
  showHistory: boolean;
  currentMembership: Membership | undefined;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  handleSave: (membership: Membership) => Promise<void>;
  handleCancel: () => void;
  handleToggleHistory: () => void;
  handleToggleForm: () => void;
}

export function useMembershipAdmin(): MembershipAdminLogic {
  const crud = useEntityCRUD(Membership);

  const [showHistory, setShowHistory] = useState(false);

  // Copia antes de ordenar: `list.sort()` ordenaría el array cacheado por
  // React Query en el lugar, mutando la caché.
  const memberships = useMemo(
    () =>
      [...crud.list].sort(
        (a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime(),
      ),
    [crud.list],
  );

  const currentMembership = useMemo(
    () => memberships.at(-1),
    [memberships],
  );

  const handleToggleHistory = useCallback(() => {
    crud.handleCancel();
    setShowHistory((prev) => !prev);
  }, [crud.handleCancel]);

  const handleToggleForm = useCallback(() => {
    if (crud.editing) {
      crud.handleCancel();
    } else {
      crud.handleNew();
    }
    setShowHistory(false);
  }, [crud.editing, crud.handleNew, crud.handleCancel]);

  return {
    memberships,
    editing: crud.editing,
    loading: crud.loading,
    showHistory,
    currentMembership,
    setShowHistory,
    handleSave: crud.handleSave,
    handleCancel: crud.handleCancel,
    handleToggleHistory,
    handleToggleForm,
  };
}

import { useState, useCallback, useMemo } from 'react';
import { Membership } from '../../../types/entities';
import { useAdminCRUD } from '../../../hooks/useAdminCRUD';

interface MembershipLogic {
  memberships: Membership[];
  editing: Membership | null;
  loading: boolean;
  showHistory: boolean;
  currentMembership: Membership | undefined;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  setEditing: React.Dispatch<React.SetStateAction<Membership | null>>;
  handleSave: (membership: Membership) => Promise<void>;
  handleCancel: () => void;
  handleToggleHistory: () => void;
  handleToggleForm: () => void;
}

const sortByDate = (list: Membership[]): Membership[] => {
  // [...list] para crear una nueva copia y no mutar el estado original
  return [...list].sort(
    (a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime()
  );
};

export function useMembershipLogic(): MembershipLogic {
  const crud = useAdminCRUD(Membership);

  const [showHistory, setShowHistory] = useState(false);

  const sortedMemberships = useMemo(() => {
    return sortByDate(crud.list);
  }, [crud.list]);

  const currentMembership = useMemo(() => {
    return sortedMemberships.at(-1);
  }, [sortedMemberships]);

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
    memberships: sortedMemberships,
    editing: crud.editing,
    loading: crud.loading,
    showHistory,
    currentMembership,
    setShowHistory,
    setEditing: crud.setEditing,
    handleSave: crud.handleSave, // Del hook genérico
    handleCancel: crud.handleCancel, // Del hook genérico
    handleToggleHistory, // Handler adaptado
    handleToggleForm, // Handler adaptado
  };
}

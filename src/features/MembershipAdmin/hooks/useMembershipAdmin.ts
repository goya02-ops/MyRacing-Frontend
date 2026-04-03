import { useState, useCallback } from 'react';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';
import { Membership } from '../../../types/entities.ts';

interface MembershipWithId extends Membership {
  id?: number;
}

export function useMembershipAdmin() {
  const { list: rawList, isLoading: loadingMemberships } = useEntityQuery(Membership as any);
  
  const { saveEntity: mutateSave } = useEntityMutation(Membership as any);

  const [editing, setEditing] = useState<MembershipWithId | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const list = rawList as MembershipWithId[];
  const sortedList = list.sort((a, b) =>
      new Date(a.dateFrom) > new Date(b.dateFrom) ? 1 : -1
  );

  const currentMembership = sortedList.at(-1);

  const handleSave = useCallback(async (membership: Membership) => {
    try {
      await mutateSave(membership); 
      setEditing(null);
    } catch (error) {
      console.error('Mutation error:', error);
      alert('Error al guardar el valor de membresía.');
    }
  }, [mutateSave]);

  const handleCancel = useCallback(() => {
    setEditing(null);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setEditing(null); 
    setShowHistory((prev) => !prev);
  }, []);

  const handleToggleForm = useCallback(() => {
    setEditing((prev) => (prev ? null : (new Membership() as MembershipWithId)));
    setShowHistory(false);
  }, []);

  return {
    memberships: sortedList,
    editing,
    loading: loadingMemberships,
    showHistory,
    currentMembership,
    
    handleSave,
    handleCancel,
    handleToggleHistory,
    handleToggleForm,
    setEditing, 
    setShowHistory,
  };
}
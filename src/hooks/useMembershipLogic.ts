import { useState, useEffect, useCallback, useMemo } from 'react';
import { Membership } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/apiService.ts';

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

const sortByDate = (list: Membership[]) => {
  return [...list].sort((a, b) =>
    new Date(a.dateFrom) > new Date(b.dateFrom) ? 1 : -1
  );
};

export function useMembershipLogic(): MembershipLogic {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetched = await fetchEntities(Membership as any);
        const sorted = sortByDate(fetched as Membership[]);
        setMemberships(sorted);
      } catch (error) {
        console.error('Error fetching membership data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentMembership = useMemo(() => {
    return memberships.at(-1);
  }, [memberships]);

  const handleSave = useCallback(async (membership: Membership) => {
    try {
      const saved = await saveEntity(Membership as any, membership);

      setMemberships((prev) => {
        const updated = [...prev, saved as Membership];
        return sortByDate(updated);
      });
      setEditing(null);
    } catch (error) {
      console.error('Error saving membership:', error);
      alert('Error al guardar el nuevo valor de membresía.');
    }
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(null);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setEditing(null);
    setShowHistory((prev) => !prev);
  }, []);

  const handleToggleForm = useCallback(() => {
    setEditing((prev) => (prev ? null : new Membership()));
    setShowHistory(false);
  }, []);

  return {
    memberships,
    editing,
    loading,
    showHistory,
    currentMembership,

    setShowHistory,
    setEditing,
    handleSave,
    handleCancel,
    handleToggleHistory,
    handleToggleForm,
  };
}

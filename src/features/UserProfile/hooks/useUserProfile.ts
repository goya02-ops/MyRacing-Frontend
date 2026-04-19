import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../../types/entities';
import { fetchMyProfile, updateMyProfile } from '../../../services/userService';
import { useUser } from '../../../context/UserContext.tsx';
import { QUERY_KEYS } from '../../../utils/queryKeys';

interface SaveResult {
  success: boolean;
  error?: string;
}

interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: { raceDateTime: string } | any;
  user: any;
}

interface UserProfileData {
  user: User | null;
  results: RaceUser[];
  formData: User;
  loading: boolean;
  isEditing: boolean;
  saving: boolean;
  stats: { totalRaces: number; victories: number; podiums: number };
  handleStartEdit: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleSave: () => Promise<SaveResult>;
  handleCancel: () => void;
}

const EMPTY_USER: User = {
  userName: '',
  realName: '',
  email: '',
  type: 'common',
} as User;

export function useUserProfile(): UserProfileData {
  const queryClient = useQueryClient();
  const { user: contextUser } = useUser();
  const userId = contextUser?.id;

  const [formData, setFormData] = useState<User>(EMPTY_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const profileQueryKey = [QUERY_KEYS.PROFILE, userId] as const;

  const { data, isLoading, error } = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchMyProfile,
    enabled: !!userId,
    retry: 1,
  });

  // Log para debugging
  if (error) {
    console.error('Error loading profile:', error);
  }

  const { mutateAsync } = useMutation({
    mutationFn: ({ realName, email }: { realName: string; email: string }) =>
      updateMyProfile(realName, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });

  const user = data?.user || null;
  const results = data?.results || [];
  const loading = isLoading;

  const handleStartEdit = useCallback(() => {
    if (data?.user) {
      setFormData({ ...data.user });
    }
    setIsEditing(true);
  }, [data]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev!,
        [name]: value,
      }));
    },
    [],
  );

  const handleSave = useCallback(async (): Promise<SaveResult> => {
    if (!formData || !formData.id) {
      return { success: false, error: 'Datos inválidos' };
    }

    if (!formData.realName.trim() || !formData.email.includes('@')) {
      return { success: false, error: 'validation' };
    }

    setIsSaving(true);

    try {
      await mutateAsync({
        realName: formData.realName,
        email: formData.email,
      });

      setIsEditing(false);

      // Update local user in context
      if (contextUser) {
        const updatedUser = { ...contextUser, realName: formData.realName, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      return {
        success: false,
        error: 'Fallo al actualizar el perfil en el servidor.',
      };
    } finally {
      setIsSaving(false);
    }
  }, [formData, mutateAsync]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (data?.user) {
      setFormData({ ...data.user });
    }
  }, [data]);

  const stats = useMemo(() => {
    const totalRaces = results.length;
    const victories = results.filter((r) => r.finishPosition === 1).length;
    const podiums = results.filter((r) => r.finishPosition <= 3).length;
    return { totalRaces, victories, podiums };
  }, [results]);

  return {
    user,
    results,
    formData,
    loading,
    isEditing,
    saving: isSaving,
    stats,
    handleStartEdit,
    handleChange,
    handleSave,
    handleCancel,
  };
}

export type { SaveResult };

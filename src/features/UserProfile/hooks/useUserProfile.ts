import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { User } from '../../../types/entities';
import { fetchProfileData, updateProfileData } from '../../../services/userService';
import { getStoredUser } from '../../../services/authService.ts';

interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: { raceDateTime: string } | any;
  user: any;
}

interface ProfileData {
  user: User;
  results: RaceUser[];
}

const EMPTY_USER: User = {
  userName: '',
  realName: '',
  email: '',
  type: 'common',
} as User;

interface UserProfileData {
  user: User | null;
  results: RaceUser[];
  formData: User;
  loading: boolean;
  isEditing: boolean;
  saving: boolean;
  stats: { totalRaces: number; victories: number; podiums: number };

  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

const PROFILE_QUERY_KEY = ['userProfile'];

export function useUserProfile(): UserProfileData {
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const userId = currentUser?.id;

  const [formData, setFormData] = useState<User>(EMPTY_USER);
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery<ProfileData, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfileData,
    enabled: !!userId, 
  });

  const { mutateAsync: mutateUpdate, isPending: isSaving } = useMutation<
    User,
    Error,
    { id: number; realName: string; email: string }
  >({
    mutationFn: ({ id, realName, email }) => updateProfileData(id, realName, email),

    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

      const storedUser = getStoredUser();
      if (storedUser) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...storedUser,
            realName: updatedData.realName,
            email: updatedData.email,
          })
        );
      }
    },
  });

  useEffect(() => {
    if (data?.user) {
      if (!isEditing) 
      setFormData({ ...data.user }); 
    }
  }, [data]);

  const user = data?.user || null;
  const results = data?.results || [];
  const loading = isLoading; 

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev!,
        [name]: value,
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!formData || !formData.id) return;

    if (!formData.realName.trim() || !formData.email.includes('@')) {
      alert('Nombre completo y email son obligatorios.');
      return;
    }

    try {
      await mutateUpdate({
        id: formData.id,
        realName: formData.realName,
        email: formData.email,
      });

      setIsEditing(false);
      alert('Perfil actualizado con éxito.');

    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Error al guardar el perfil.');
    }
  }, [formData, mutateUpdate]);

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
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
  };
}

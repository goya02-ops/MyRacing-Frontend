import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../../../types/entities';
import {
  fetchMyProfile,
  updateMyProfile,
} from '../../../services/userService';
import { getStoredUser } from '../../../services/authService.ts';

interface SaveResult {
  success: boolean;
  error?: string;
}

interface FetchResult {
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
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSave: () => Promise<SaveResult>;
  handleCancel: () => void;
}

export type { SaveResult, FetchResult };

const EMPTY_USER: User = {
  userName: '',
  realName: '',
  email: '',
  type: 'common',
} as User;

export function useUserProfile(): UserProfileData {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<RaceUser[]>([]);
  const [formData, setFormData] = useState<User>(EMPTY_USER);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<FetchResult> => {
      setLoading(true);
      try {
        const data = await fetchMyProfile();
        setUser(data.user);
        setResults(data.results as RaceUser[]);
        setFormData({ ...data.user });
        return { success: true };
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        return { success: false, error: 'No se pudo cargar el perfil de usuario.' };
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSave = useCallback(async (): Promise<SaveResult> => {
    if (!formData) return { success: false, error: 'Datos inválidos' };

    setSaving(true);

    if (!formData.realName.trim() || !formData.email.includes('@')) {
      setSaving(false);
      return { success: false, error: 'validation' };
    }

    try {
      const updatedData = await updateMyProfile(
        formData.realName,
        formData.email
      );

      setUser(updatedData);
      setFormData(updatedData);
      setIsEditing(false);

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

      return { success: true };
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      return { success: false, error: 'Fallo al actualizar el perfil en el servidor.' };
    } finally {
      setSaving(false);
    }
  }, [formData]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

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
    saving,
    stats,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
  };
}
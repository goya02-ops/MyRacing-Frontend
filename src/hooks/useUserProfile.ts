import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types/entities';
import { fetchProfileData, updateProfileData } from '../services/userService';
import { getStoredUser } from '../services/authService.ts';
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
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

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
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchProfileData();

        setUser(data.user);
        setResults(data.results as RaceUser[]);
        setFormData({ ...data.user });
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        alert('Error al cargar el perfil.');
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

  const handleSave = useCallback(async () => {
    if (!formData || !formData.id) return;

    setSaving(true);

    if (!formData.realName.trim() || !formData.email.includes('@')) {
      alert('Nombre completo y email son obligatorios.');
      setSaving(false);
      return;
    }

    try {
      const updatedData = await updateProfileData(
        formData.id,
        formData.realName,
        formData.email
      );

      setUser(updatedData);
      setFormData(updatedData);
      setIsEditing(false);

      alert('Perfil actualizado con éxito.');

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
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Error al guardar el perfil.');
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

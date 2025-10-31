import { useState } from 'react';
import { registerUserToRace } from '../services/raceService.ts';
import { User, Race } from '../types/entities';

export function useRaceInscription(user: User | null, race: Race | null) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInscription = async () => {
    if (!user || !race) return;
    try {
      setLoading(true);
      await registerUserToRace(user.id!, race.id!);
      setSuccess(true);
    } catch (err) {
      console.error('Error al inscribirse:', err);
      alert('No se pudo inscribir, intente nuevamente');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    success,
    handleInscription,
  };
}

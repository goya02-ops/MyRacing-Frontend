// import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile.ts';

import { UserStatsCard } from '../components/UserStatsCard.tsx';
import { UserDataForm } from '../components/UserData.tsx';
import { UserRaceHistory } from '../components/UserRaceHistory.tsx';
import Spinner from '../../../components/Spinner.tsx';

export default function UserProfile() {
  const {
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
  } = useUserProfile();

  const { totalRaces, victories, podiums } = stats;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <Spinner>Cargando usuario</Spinner>
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        <p className="text-lg">No se pudo cargar el perfil de usuario.</p>
      </div>
    );
  }

  const lastRaceDate = results[0]?.race?.raceDateTime
    ? new Date(results[0].race.raceDateTime).toLocaleDateString('es-AR')
    : 'N/A';

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 **bg-gray-900** text-gray-200 min-h-screen">
      {totalRaces > 0 && (
        <UserStatsCard
          stats={{ totalRaces, victories, podiums, lastRaceDate }}
        />
      )}

      <UserDataForm
        user={user}
        formData={formData}
        isEditing={isEditing}
        saving={saving}
        handleChange={handleChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        setIsEditing={setIsEditing}
      />

      <UserRaceHistory results={results} />
    </div>
  );
}

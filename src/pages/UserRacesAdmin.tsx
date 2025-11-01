import { Card } from '../components/tremor/TremorComponents';
import { useUserRacesPage } from '../hooks/useUserRacesPage';
import UserListPanel from '../components/UserRaces/UserListPanel';
import { RaceResultsPanel } from '../components/UserRaces/RaceResultPanel.tsx';
import Spinner from '../components/Spinner.tsx';

export default function UserRacesAdmin() {
  const {
    users,
    selectedUserId,
    raceUsers,
    loadingUsers,
    loadingRaces,
    handleUserSelect,
    selectedUser,
    userSearchTerm,
    setUserSearchTerm,
    minFinishPosition,
    setMinFinishPosition,
    raceDateFrom,
    setRaceDateFrom,
    filteredRaceUsers,
  } = useUserRacesPage();

  if (loadingUsers) {
    return <Spinner>Cargando usuarios...</Spinner>;
  }

  return (
    <Card className="text-gray-200">
      <h2 className="text-xl font-semibold mb-6">Carreras por Usuario</h2>

      <div className="flex flex-col md:flex-row gap-6">
        <UserListPanel
          users={users}
          selectedUserId={selectedUserId}
          handleUserSelect={handleUserSelect}
          userSearchTerm={userSearchTerm}
          setUserSearchTerm={setUserSearchTerm}
        />

        <RaceResultsPanel
          selectedUser={selectedUser}
          loadingRaces={loadingRaces}
          raceUsers={raceUsers}
          filteredRaceUsers={filteredRaceUsers}
          minFinishPosition={minFinishPosition}
          setMinFinishPosition={setMinFinishPosition}
          raceDateFrom={raceDateFrom}
          setRaceDateFrom={setRaceDateFrom}
        />
      </div>
    </Card>
  );
}

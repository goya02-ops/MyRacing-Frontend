import { useState, useEffect } from 'react';
import { User } from '../types/entities';
import { fetchEntities } from '../services/apiMyRacing';
import {
  Card,
  Button,
  Badge,
  Divider,
} from '../components/tremor/TremorComponents';

// Definimos la interfaz RaceUser según el backend
export interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: any; // Lo definiremos mejor después
  user: any;
}

export default function UserRaces() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [raceUsers, setRaceUsers] = useState<RaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);

  // Cargar lista de usuarios al inicio (sin admin)
  useEffect(() => {
    fetchEntities(User)
      .then((users) => {
        const nonAdminUsers = users.filter((u) => u.type !== 'admin');
        setUsers(nonAdminUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Cargar carreras cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUserId) {
      setLoadingRaces(true);
      // Endpoint corregido: agregado /by-user
      fetch(
        `http://localhost:3000/api/race-users/by-user?userId=${selectedUserId}`
      )
        .then((res) => res.json())
        .then((data) => {
          setRaceUsers(data.data || data);
        })
        .catch((error) => {
          console.error('Error cargando carreras:', error);
          setRaceUsers([]);
        })
        .finally(() => setLoadingRaces(false));
    } else {
      setRaceUsers([]);
    }
  }, [selectedUserId]);

  const handleUserSelect = (userId: number) => {
    // Si se hace clic en el mismo usuario, se des-selecciona
    setSelectedUserId((prevId) => (prevId === userId ? null : userId));
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Helper para formatear fechas
  const formatDateTime = (value: Date | string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
      <h2 className="text-xl font-semibold mb-6">Carreras por Usuario</h2>

      <div className="flex flex-col md:flex-row gap-6">
      
        <div className="flex-none md:w-72 md:border-r md:border-gray-700/50 md:pr-6">
          <h3 className="text-lg font-semibold mb-4">Usuarios</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <Button
                key={user.id}
                onClick={() => handleUserSelect(user.id!)}
                variant={selectedUserId === user.id ? 'primary' : 'ghost'}
                className="w-full !justify-start !text-left h-auto py-3"
              >
                <div>
                  <div className="font-medium">{user.userName}</div>
                  <div className="text-sm font-normal opacity-70">
                    {user.realName}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

       
        <div className="flex-1 min-w-0">
         
          {!selectedUser && (
            <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 py-20">
              <span className="text-5xl mb-4">←</span>
              <span className="text-lg">
                Seleccione un usuario para ver sus carreras
              </span>
            </div>
          )}

        
          {selectedUser && (
            <>
             
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-orange-400">
                    {selectedUser.realName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    @{selectedUser.userName}
                  </p>
                </div>
                {!loadingRaces && (
                  <Badge variant="neutral" className="text-base">
                    Total de carreras: {raceUsers.length}
                  </Badge>
                )}
              </div>
              <Divider className="my-4" />

              
              {loadingRaces && (
                <div className="text-center text-gray-400 py-10">
                  Cargando carreras...
                </div>
              )}

              {!loadingRaces && raceUsers.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  Este usuario no está inscripto en ninguna carrera.
                </div>
              )}

             
              {!loadingRaces && raceUsers.length > 0 && (
                <div className="space-y-2">
                  {/* Encabezado de la lista */}
                  <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4 border-b border-gray-700/50">
                    <div className="flex-1">Fecha de Inscripción</div>
                    <div className="flex-1">Fecha de la Carrera</div>
                    <div className="w-24 text-center">Largada</div>
                    <div className="w-24 text-center">Llegada</div>
                  </div>

                 
                  {raceUsers.map((ru) => (
                    <div
                      key={ru.id}
                      className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50"
                    >
                      <div className="flex-1 w-full md:w-auto mb-2 md:mb-0 font-medium">
                        {formatDateTime(ru.registrationDateTime)} hs
                      </div>
                      <div className="flex-1 w-full md:w-auto mb-2 md:mb-0">
                        {formatDateTime(ru.race?.raceDateTime)} hs
                      </div>
                      <div className="w-full md:w-24 flex justify-start md:justify-center mb-2 md:mb-0">
                        <Badge variant="neutral">{ru.startPosition}</Badge>
                      </div>
                      <div className="w-full md:w-24 flex justify-start md:justify-center">
                        <Badge variant="neutral">{ru.finishPosition}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
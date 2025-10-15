import { useState, useEffect } from 'react';
import { User } from '../types/entities';
import { fetchEntities } from '../services/apiMyRacing';

// Definimos la interfaz RaceUser según el backend
interface RaceUser {
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
        const nonAdminUsers = users.filter(
          (u) => u.type !== 'Admin' && u.type !== 'admin'
        );
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
    setSelectedUserId(userId);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <section>
      <h2>Carreras por Usuario</h2>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Lista de usuarios (izquierda) */}
        <div
          style={{
            flex: '0 0 250px',
            borderRight: '1px solid #ccc',
            paddingRight: '20px',
          }}
        >
          <h3>Usuarios</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => handleUserSelect(user.id!)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    backgroundColor:
                      selectedUserId === user.id ? '#007bff' : '#f0f0f0',
                    color: selectedUserId === user.id ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: selectedUserId === user.id ? 'bold' : 'normal',
                  }}
                >
                  {user.userName}
                  <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                    {user.realName}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Detalle de carreras (derecha) */}
        <div style={{ flex: 1 }}>
          {!selectedUser ? (
            <div
              style={{ textAlign: 'center', padding: '40px', color: '#666' }}
            >
              ← Seleccione un usuario para ver sus carreras
            </div>
          ) : (
            <>
              <h3>
                Carreras de: {selectedUser.realName} (@{selectedUser.userName})
              </h3>

              {loadingRaces ? (
                <div>Cargando carreras...</div>
              ) : raceUsers.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#666',
                  }}
                >
                  Este usuario no está inscripto en ninguna carrera
                </div>
              ) : (
                <>
                  <p>
                    <strong>Total de carreras inscriptas:</strong>{' '}
                    {raceUsers.length}
                  </p>

                  <table>
                    <thead>
                      <tr>
                        <th>Fecha de Inscripción</th>
                        <th>Fecha de la Carrera</th>
                        <th>Puesto Salida</th>
                        <th>Puesto Llegada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raceUsers.map((ru) => (
                        <tr key={ru.id}>
                          <td>
                            {new Date(ru.registrationDateTime).toLocaleString(
                              'es-AR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </td>
                          <td>
                            {ru.race?.raceDateTime
                              ? new Date(ru.race.raceDateTime).toLocaleString(
                                  'es-AR',
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : 'N/A'}
                          </td>
                          <td>{ru.startPosition}</td>
                          <td>{ru.finishPosition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

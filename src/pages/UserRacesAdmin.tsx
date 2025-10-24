import { useState, useEffect, useMemo } from 'react';
import { User } from '../types/entities';
import { fetchEntities } from '../services/apiMyRacing';
import {
    Card,
    Badge,
    Divider,
} from '../components/tremor/TremorComponents';


import UserListPanel from '../components/UserRaces/UserListPanel'; 
import RaceFilterPanel from '../components/UserRaces/RaceFilterPanel';

// Definimos la interfaz RaceUser
export interface RaceUser {
    id?: number;
    registrationDateTime: string | Date;
    startPosition: number;
    finishPosition: number;
    race: { raceDateTime: string | Date, [key: string]: any };
    user: any;
}

// Formayeo de fechas
const formatDateTime = (value: Date | string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return date.toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export default function UserRaces() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [raceUsers, setRaceUsers] = useState<RaceUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRaces, setLoadingRaces] = useState(false);
    
    // Estados de filtros
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [minFinishPosition, setMinFinishPosition] = useState<number | ''>('');
    const [raceDateFrom, setRaceDateFrom] = useState('');

    useEffect(() => {
        fetchEntities(User)
            .then((users) => {
                const nonAdminUsers = users.filter((u) => u.type !== 'admin');
                setUsers(nonAdminUsers);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedUserId) {
            setRaceUsers([]);
            return;
        }

        setLoadingRaces(true);
        // No reseteamos los filtros aquí para que el usuario pueda volver a filtrar si cambia de usuario.
        
        fetch(`http://localhost:3000/api/race-users/by-user?userId=${selectedUserId}`)
            .then((res) => res.json())
            .then((data) => setRaceUsers(data.data || data))
            .catch((error) => {
                console.error('Error cargando carreras:', error);
                setRaceUsers([]);
            })
            .finally(() => setLoadingRaces(false));
    }, [selectedUserId]);

    const handleUserSelect = (userId: number) => {
        setSelectedUserId((prevId) => (prevId === userId ? null : userId));
    };

    const selectedUser = users.find((u) => u.id === selectedUserId);

 
    const filteredRaceUsers = useMemo(() => {
        return raceUsers.filter((ru) => {
            let matchesPosition = true;
            let matchesDate = true;

            // Filtro por posición
            if (minFinishPosition !== '') {
                const minPos = Number(minFinishPosition);
                matchesPosition = ru.finishPosition > 0 && ru.finishPosition <= minPos;
            }

            // Filtrar por fecha
            if (raceDateFrom && ru.race?.raceDateTime) {
                const raceDate = new Date(ru.race.raceDateTime).getTime();
                const filterDate = new Date(raceDateFrom).getTime();
                // Se simplifica la comparación de fechas a milisegundos.
                matchesDate = raceDate >= filterDate;
            }

            return matchesPosition && matchesDate;
        });
    }, [raceUsers, minFinishPosition, raceDateFrom]);


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
                
             
                <UserListPanel 
                    users={users}
                    selectedUserId={selectedUserId}
                    handleUserSelect={handleUserSelect}
                    userSearchTerm={userSearchTerm}
                    setUserSearchTerm={setUserSearchTerm}
                />

                
              
                <div className="flex-1 min-w-0">
                    
                    {!selectedUser && (
                        <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 py-20">
                            <span className="text-5xl mb-4">←</span>
                            <span className="text-lg">Seleccione un usuario para ver sus carreras</span>
                        </div>
                    )}

                    {selectedUser && (
                        <>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-orange-400">{selectedUser.realName}</h3>
                                    <p className="text-sm text-gray-400">@{selectedUser.userName}</p>
                                </div>
                                {!loadingRaces && (
                                    <Badge variant="neutral" className="text-base">
                                        Carreras visibles: {filteredRaceUsers.length} / {raceUsers.length}
                                    </Badge>
                                )}
                            </div>
                            <Divider className="my-4" />

                           
                            <RaceFilterPanel
                                minFinishPosition={minFinishPosition}
                                setMinFinishPosition={setMinFinishPosition}
                                raceDateFrom={raceDateFrom}
                                setRaceDateFrom={setRaceDateFrom}
                            />
                            
                            {loadingRaces && (
                                <div className="text-center text-gray-400 py-10">
                                    Cargando carreras...
                                </div>
                            )}

                            {!loadingRaces && filteredRaceUsers.length === 0 && (
                                <div className="text-center text-gray-500 py-10">
                                    No hay carreras que coincidan con los filtros.
                                </div>
                            )}

                            
                            {!loadingRaces && filteredRaceUsers.length > 0 && (
                                <div className="space-y-2">
                                    
                                    <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4 border-b border-gray-700/50">
                                        <div className="flex-1">Fecha de Inscripción</div>
                                        <div className="flex-1">Fecha de la Carrera</div>
                                        <div className="w-24 text-center">Largada</div>
                                        <div className="w-24 text-center">Llegada</div>
                                    </div>

                                  
                                    {filteredRaceUsers.map((ru) => (
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
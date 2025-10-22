import React, { useState, useEffect } from 'react';
import { User } from '../types/entities'; 
import { fetchWithAuth, getStoredUser } from '../services/apiMyRacing';
import { Card } from '../components/tremor/Card';
import { Button } from '../components/tremor/Button';
import { Input } from '../components/tremor/Input';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '../components/tremor/Table';
import { Badge } from '../components/tremor/Badge';
import { Divider } from '../components/tremor/Divider';


interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: any;
  user: any;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<RaceUser[]>([]); 
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentUser = getStoredUser();
        
        if (!currentUser || !currentUser.id) {
          throw new Error('Usuario no autenticado');
        }

        const userResponse = await fetchWithAuth(`/users/${currentUser.id}`);
        const userData = await userResponse.json();
        
        const racesResponse = await fetchWithAuth(`/race-users/by-user?userId=${currentUser.id}`);
        const racesData = await racesResponse.json();
        
        setUser(userData.data);
        setResults(racesData.data || []);
        setFormData(userData.data);
        
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        alert('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ 
        ...formData, 
        [name]: value 
      });
    }
  };
  
  const handleSave = async () => {
    if (!formData || !formData.id) return;

    setSaving(true);
    
    if (!formData.realName.trim() || !formData.email.includes('@')) {
      alert('Nombre completo y email son obligatorios.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetchWithAuth(`/users/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realName: formData.realName,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      const updatedData = await response.json();
      
      setUser(updatedData.data); 
      setFormData(updatedData.data);
      setIsEditing(false);
      
      alert('Perfil actualizado con éxito.');
      
      const storedUser = getStoredUser();
      if (storedUser) {
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          realName: updatedData.data.realName,
          email: updatedData.data.email,
        }));
      }
      
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Error al guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({ ...user }); 
    }
  };

  // Calcular estadísticas
  const totalRaces = results.length;
  const victories = results.filter(r => r.finishPosition === 1).length;
  const podiums = results.filter(r => r.finishPosition <= 3).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </Card>
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-lg text-red-600 dark:text-red-400">No se pudo cargar el perfil de usuario.</p>
        </Card>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">

      
      {totalRaces > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-t-4 border-t-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Carreras</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{totalRaces}</p>
          </Card>
          
          <Card className="border-t-4 border-t-yellow-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Victorias 🥇</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{victories}</p>
          </Card>
          
          <Card className="border-t-4 border-t-orange-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Podios 🏆</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{podiums}</p>
          </Card>
          
          <Card className="border-t-4 border-t-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Última Carrera</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {results[0]?.race?.raceDateTime 
                ? new Date(results[0].race.raceDateTime).toLocaleDateString('es-AR')
                : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Mi Perfil de Carreras</h1>
          <Badge color={user.type === 'admin' ? 'orange' : 'blue'}>
            {user.type.toUpperCase()}
          </Badge>
        </div>

        
        <Card>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Datos Personales</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario (Login)
              </label>
              <Input 
                type="text" 
                value={user.userName} 
                disabled 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo *
              </label>
              <Input
                type="text"
                name="realName"
                value={formData.realName}
                onChange={handleChange}
                disabled={!isEditing || saving}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!isEditing || saving}
              />
            </div>
          </div>

          <Divider />

          <div className="flex gap-2 justify-end">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleCancel} 
                  disabled={saving}
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Historial de Carreras 🏁
          </h3>
          <Badge color="gray">{results.length} carreras</Badge>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Aún no tienes resultados de carreras registrados.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              ¡Inscríbete en tu primera carrera!
            </p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Fecha Registro</TableHeaderCell>
                <TableHeaderCell>Fecha Carrera</TableHeaderCell>
                <TableHeaderCell className="text-center">Pos. Salida</TableHeaderCell>
                <TableHeaderCell className="text-center">Pos. Final</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((ru) => (
                <TableRow key={ru.id}>
                  <TableCell>
                    {new Date(ru.registrationDateTime).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  
                  <TableCell>
                    {ru.race?.raceDateTime 
                      ? new Date(ru.race.raceDateTime).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {ru.startPosition}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">
                        {ru.finishPosition}
                      </span>
                      {ru.finishPosition === 1 && <span className="text-2xl">🥇</span>}
                      {ru.finishPosition === 2 && <span className="text-2xl">🥈</span>}
                      {ru.finishPosition === 3 && <span className="text-2xl">🥉</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
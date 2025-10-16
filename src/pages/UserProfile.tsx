import React, { useState, useEffect } from 'react';
import { User } from '../types/entities'; 
import { fetchWithAuth, getStoredUser } from '../services/apiMyRacing';

interface RaceUser {
  id?: number;
  registrationDateTime: string | Date;
  startPosition: number;
  finishPosition: number;
  race: any;
  user: any;
}

export default function UserProfile(){
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
      const response = await fetchWithAuth(`/users/${formData.id}`,  {
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

  if (loading) return <div>Cargando perfil...</div>;
  if (!user || !formData) return <div>No se pudo cargar el perfil de usuario.</div>;

  return (
    <div className="user-profile-container">
      <h2>Mi Perfil de Carreras</h2>
      
      <section className="profile-details-card">
        <h3>Datos Personales</h3>
        
        
        <form id="profile-form" onSubmit={handleSave}>
          
          <div className="profile-field">
            <label>Usuario (Login):</label>
            <input type="text" value={user.userName} disabled />
          </div>

          <div className="profile-field">
            <label>Nombre Completo:</label>
            <input
              type="text"
              name="realName"
              value={formData.realName}
              onChange={handleChange}
              disabled={!isEditing || saving}
              required
            />
          </div>
          
          <div className="profile-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!isEditing || saving}
            />
          </div>

          <div className="profile-field">
            <label>Plan:</label>
            <span className={`profile-status ${user.type}`}>
              {user.type.toUpperCase()}
            </span>
          </div>
        </form>
        

       
        <div className="profile-actions">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </button>
          ) : (
            <>
              
              <button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" onClick={handleCancel} disabled={saving}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </section>

     
    
      
      <section className="race-results-card mt-4">
        <h3>Historial de Carreras ({results.length}) 🏆</h3>
        
        {results.length === 0 ? (
          <p>Aún no tienes resultados de carreras registrados.</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Fecha Registro</th>
                <th>Fecha Carrera</th>
                <th>Pos. Salida</th>
                <th>Pos. Final</th>
              </tr>
            </thead>
            <tbody>
              {results.map((ru) => (
                <tr key={ru.id} className={ru.finishPosition === 1 ? 'winner-row' : ''}> 
                  
                  <td>
                    {new Date(ru.registrationDateTime).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  
                  <td>
                    {ru.race?.raceDateTime 
                      ? new Date(ru.race.raceDateTime).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </td>
                  
                  <td>{ru.startPosition}</td>
                  
                  <td>
                    <strong style={{ 
                      color: ru.finishPosition === 1 ? '#ffd700' : 'inherit',
                      fontWeight: ru.finishPosition <= 3 ? 'bold' : 'normal'
                    }}>
                      {ru.finishPosition}
                      {ru.finishPosition === 1 && ' 🥇'}
                      {ru.finishPosition === 2 && ' 🥈'}
                      {ru.finishPosition === 3 && ' 🥉'}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
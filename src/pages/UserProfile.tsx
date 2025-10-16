import React, { useState, useEffect } from 'react';
import { User } from '../types/entities'; 
import type { RaceUser } from '../pages/UserRacesAdmin';
import { MOCK_USER_PROFILE, MOCK_RACE_RESULTS } from '../mocks/user.mock'; 

interface UserProfileProps {
  userId: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simulateFetchData = (_: number): Promise<{user: User, results: RaceUser[]}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: new User(MOCK_USER_PROFILE),
                results: MOCK_RACE_RESULTS,
            });
        }, 500);
    });
};

const simulateSaveUser = (data: User): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data); 
        }, 500);
    });
};


export default function UserProfile({ userId }: UserProfileProps) {
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
        const data = await simulateFetchData(userId); 
        
        setUser(data.user);
        setResults(data.results); 
        setFormData(new User(data.user)); 
        
      } catch (error) {
        console.error('Error al cargar datos del perfil (Mock):', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ 
        ...formData, 
        [name]: value as any 
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    
    if (!formData.realName.trim() || !formData.email.includes('@')) {
      alert('Nombre completo y email son obligatorios.');
      setSaving(false);
      return;
    }

    try {
      const savedUser = await simulateSaveUser(formData);
      
      setUser(savedUser); 
      setIsEditing(false); 
      alert('Perfil actualizado con éxito (MOCK).');
      
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
          setFormData(new User(user));
      }
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (!user || !formData) return <div>No se pudo cargar el perfil de usuario.</div>;

  return (
    <div className="user-profile-container">
      <h2>Mi Perfil de Carreras</h2>
      <p>Modo: **MOCK DE DATOS**</p> 
      
      {/* ========================================================= */}
      {/* SECCIÓN 1: DATOS PERSONALES (Formulario y Edición) */}
      {/* ========================================================= */}
      <section className="profile-details-card">
        <h3>Datos Personales</h3>
        
        <form onSubmit={handleSave}>
          
          {/* USERNAME (Solo lectura) */}
          <div className="profile-field">
            <label>Usuario (Login):</label>
            <input type="text" value={user.userName} disabled />
          </div>

          {/* REALNAME (Editable) */}
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
          
          {/* EMAIL (Editable) */}
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

          {/* TIPO DE PLAN (Solo lectura) */}
          <div className="profile-field">
            <label>Plan:</label>
            <span className={`profile-status ${user.type}`}>{user.type.toUpperCase()}</span>
          </div>

          {/* Botones de Acción */}
          <div className="profile-actions">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)}>
                Editar Perfil
              </button>
            ) : (
              <>
                <button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={handleCancel} disabled={saving}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 2: RESULTADOS DE CARRERAS */}
      {/* ========================================================= */}
      <section className="race-results-card mt-4">
        <h3>Historial de Carreras ({results.length}) 🏆</h3>
        
        {results.length === 0 ? (
            <p>Aún no tienes resultados de carreras registrados.</p>
        ) : (
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Fecha Registro</th>
                        <th>Carrera</th>
                        <th>Pos. Salida</th>
                        <th>Pos. Final</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((ru) => (
                        <tr key={ru.id} className={ru.finishPosition === 1 ? 'winner-row' : ''}> 
                            <td>{new Date(ru.registrationDateTime).toLocaleDateString()}</td>
                            <td>{ru.race}</td> 
                            <td>{ru.startPosition}</td>
                            <td><strong>{ru.finishPosition}</strong></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </section>
    </div>
  );
}

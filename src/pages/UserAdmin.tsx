import { useState, useEffect } from 'react';
import { User } from '../types/entities';
import { fetchEntities } from '../services/service';

export default function UserAdmin() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntities(User)
      .then((users) => {
        // Filtrar solo usuarios que NO sean administradores
        const nonAdminUsers = users.filter((u) => u.type !== 'Admin' && u.type !== 'admin');
        setList(nonAdminUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // La función handleChangeType ya no es necesaria si el botón no la llama
  // const handleChangeType = async (user: User, newType: string) => { ... };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <section>
      <h2>Administrar Usuarios</h2>
      
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Total de usuarios: <strong>{list.length}</strong>
      </p>

      <table>
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Nombre Real</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            list.map((user) => (
              <tr key={user.id}>
                <td>{user.userName}</td>
                <td>{user.realName}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: user.type === 'Premium' ? '#e0e0e0' : '#e0e0e0',
                      color: user.type === 'Premium' ? '#000' : '#333',
                      fontWeight: 'bold',
                      fontSize: '0.9em',
                    }}
                  >
                    {user.type}
                  </span>
                </td>
                <td>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6c757d', 
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'not-allowed', 
                      }}
                      disabled // Deshabilita el botón
                    >
                      Funcionalidad futura
                    </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
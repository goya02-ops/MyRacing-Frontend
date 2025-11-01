import React, { useMemo } from 'react';
import { Button } from '../tremor/TremorComponents';
import { User } from '../../types/entities';

interface UserListPanelProps {
  users: User[];
  selectedUserId: number | null;
  handleUserSelect: (userId: number) => void;
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
}

const UserListPanel: React.FC<UserListPanelProps> = ({
  users,
  selectedUserId,
  handleUserSelect,
  userSearchTerm,
  setUserSearchTerm,
}) => {
  // Lógica de filtrado de usuarios
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    const term = userSearchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.userName.toLowerCase().includes(term) ||
        user.realName.toLowerCase().includes(term)
    );
  }, [users, userSearchTerm]);

  return (
    <div className="flex-none md:w-72 md:border-r md:border-gray-700/50 md:pr-6">
      <h3 className="text-lg font-semibold mb-4">Usuarios</h3>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar por usuario o nombre..."
          className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 pr-8"
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
        />

        {userSearchTerm && (
          <button
            type="button"
            onClick={() => setUserSearchTerm('')}
            className="absolute right-0 top-0 h-full w-8 flex items-center justify-center text-gray-400 hover:text-white"
            aria-label="Limpiar búsqueda de usuario"
          >
            &times;
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {filteredUsers.map((user) => (
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
  );
};

export default UserListPanel;

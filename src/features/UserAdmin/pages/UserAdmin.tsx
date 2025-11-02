import {
  Card,
  Badge,
  Button,
} from '../../../components/tremor/TremorComponents';

import { useUserAdmin } from '../hooks/useUserAdmin';
import Spinner from '../../../components/Spinner';

export default function UserAdmin() {
  const { list, loading } = useUserAdmin();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner>Cargando usuarios...</Spinner>
      </div>
    );
  }

  return (
    <Card className="text-gray-200 p-0">
      <div className="flex justify-between items-center p-6">
        <h2 className="text-xl font-semibold">Usuarios Registrados</h2>
        <Badge color="gray">Total: {list.length}</Badge>
      </div>
      <div className="px-6">
        <div className="hidden md:flex text-sm font-semibold text-gray-400 border-b border-gray-700/50 pb-2">
          <div className="w-1/4">Nombre de Usuario</div>
          <div className="w-1/4">Nombre Real</div>
          <div className="w-1/4">Email</div>
          <div className="w-1/6">Tipo</div>
          <div className="w-1/6">Acciones</div>
        </div>

        <div className="divide-y divide-gray-700/50">
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No hay usuarios para mostrar
            </div>
          ) : (
            list.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row items-start md:items-center py-4"
              >
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  <span className="font-semibold md:hidden">Usuario: </span>
                  {user.userName}
                </div>
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  <span className="font-semibold md:hidden">Nombre: </span>
                  {user.realName}
                </div>
                <div className="w-full md:w-1/4 mb-2 md:mb-0 truncate">
                  <span className="font-semibold md:hidden">Email: </span>
                  {user.email}
                </div>
                <div className="w-full md:w-1/6 mb-2 md:mb-0">
                  <Badge color={user.type === 'premium' ? 'blue' : 'gray'}>
                    {user.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="w-full md:w-1/6">
                  <Button variant="secondary" disabled>
                    Funcionalidad futura
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

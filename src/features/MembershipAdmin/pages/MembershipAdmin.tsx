import { lazy, Suspense } from 'react'; 
import { useMembershipAdmin } from '../hooks/useMembershipAdmin';
import {
  Card,
  Button,
  Divider,
  Label,
} from '../../../components/tremor/TremorComponents';


const MembershipForm = lazy(() => import('../components/MembershipForm'));
const MembershipHistory = lazy(() => import('../components/MembershipHistory'));

export default function MembershipAdmin() {
  const {
    memberships,
    editing,
    loading,
    showHistory,
    currentMembership,
    handleSave,
    handleCancel,
    handleToggleHistory,
    handleToggleForm,
  } = useMembershipAdmin();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        Cargando membresías...
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
     
      {/* 3.1 BOTONES DE CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Administrar Membresías</h2>
        <div className="flex gap-2">
          
          {/* Botón para ver historial */}
          <Button
            onClick={handleToggleHistory}
            variant={showHistory ? 'primary' : 'ghost'}
          >
            {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </Button>
          
          {/* Botón para abrir/cerrar el formulario */}
          <Button
            onClick={handleToggleForm}
            variant={editing ? 'secondary' : 'primary'}
          >
            {editing ? 'Cancelar Nuevo Valor' : '+ Nuevo Valor'}
          </Button>
       
        </div>
      </div>

      {/* 3.2 VALOR ACTUAL */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <Label className="text-sm">Valor Actual</Label>
        {!currentMembership ? (
          <p className="text-gray-400 mt-2">
            Aún no se cargó ninguna membresía
          </p>
        ) : (
          <>
            <p className="text-3xl font-semibold text-orange-400 mt-1">
              ${currentMembership.price}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vigente desde:{' '}
              {new Date(currentMembership.dateFrom).toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              hs
            </p>
          </>
        )}
      </div>

      {/* 3.3 HISTORIAL DE VALORES (Carga dinámica) */}
      {showHistory && (
        <Suspense
          fallback={
            <div className="text-center p-4">Cargando historial...</div>
          }
        >
          <Divider className="my-6" />
          <h3 className="text-lg font-semibold mb-4">Historial de Valores</h3>
          <MembershipHistory memberships={memberships} />
        </Suspense>
      )}

      {/* 3.4 FORMULARIO DE NUEVO VALOR (Carga dinámica) */}
      {editing && (
        <Suspense
          fallback={
            <div className="text-center p-4">Cargando formulario...</div>
          }
        >
          <Divider className="my-6" />
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Establecer Nuevo Valor
            </h3>
            <MembershipForm
              initial={editing}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          </div>
        </Suspense>
      )}
    </Card>
  );
}

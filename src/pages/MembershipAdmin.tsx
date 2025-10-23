import { lazy, useState, useEffect, Suspense } from 'react';
import { Membership } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
import {
  Card,
  Button,
  Divider,
  Label,
} from '../components/tremor/TremorComponents';


const MembershipForm = lazy(() => import('../components/MembershipForm'));
const MembershipHistory = lazy(() => import('../components/MembershipHistory'));

export default function MembershipAdmin() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetched = await fetchEntities(Membership);
        // Ordenamos por fecha, de más antigua a más nueva
        const sorted = [...fetched].sort((a, b) =>
          new Date(a.dateFrom) > new Date(b.dateFrom) ? 1 : -1
        );
        setMemberships(sorted);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // El último ítem del array ordenado es el actual
  const currentM = memberships.at(-1);

  const handleSave = async (membership: Membership) => {
    const saved = await saveEntity(Membership, membership);
    // Agregamos el nuevo y re-ordenamos
    const updated = [...memberships, saved].sort((a, b) =>
      new Date(a.dateFrom) > new Date(b.dateFrom) ? 1 : -1
    );
    setMemberships(updated);
    setEditing(null); // Cierra el formulario al guardar
  };

  const handleCancel = () => {
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        Cargando membresías...
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
     
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Administrar Membresías</h2>
        <div className="flex gap-2">
          {/* Botón para ver historial */}
          <Button
            onClick={() => {
              setEditing(null); // Cierra el form si está abierto
              setShowHistory(!showHistory);
            }}
            variant={showHistory ? 'primary' : 'ghost'}
          >
            {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </Button>
          
        
          <Button
            onClick={() => {
              setEditing(editing ? null : new Membership());
              setShowHistory(false); // Cierra el historial si está abierto
            }}
            // 'default' no es válido. Usamos 'primary' para la acción 
            // principal y 'secondary' (o 'ghost') para cancelar.
            variant={editing ? 'secondary' : 'primary'}
          >
            {editing ? 'Cancelar Nuevo Valor' : '+ Nuevo Valor'}
          </Button>
       

        </div>
      </div>

     
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <Label className="text-sm">Valor Actual</Label>
        {!currentM ? (
          <p className="text-gray-400 mt-2">
            Aún no se cargó ninguna membresía
          </p>
        ) : (
          <>
            <p className="text-3xl font-semibold text-orange-400 mt-1">
              ${currentM.price}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vigente desde: {
                new Date(currentM.dateFrom).toLocaleString('es-AR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })
              } hs
            </p>
          </>
        )}
      </div>

      
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
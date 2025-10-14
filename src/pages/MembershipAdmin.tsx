import { lazy, useState, useEffect } from 'react';
import { Membership } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/service.ts';
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

  const currentM = memberships.at(-1);

  const handleSave = async (membership: Membership) => {
    const saved = await saveEntity(Membership, membership);
    const updated = [...memberships, saved].sort((a, b) =>
      new Date(a.dateFrom) > new Date(b.dateFrom) ? 1 : -1
    );
    setMemberships(updated);
    setEditing(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h2>Administrar Membresías</h2>

      <button
        onClick={() => {
          setEditing(new Membership());
          setShowHistory(false);
        }}
      >
        + Nuevo valor de membresía
      </button>

      <button
        onClick={() => {
          setEditing(null);
          if (showHistory) setShowHistory(false);
          else setShowHistory(true);
        }}
      >
        Historial de membresía
      </button>

      {!currentM ? (
        <h3>Aún no se cargó ninguna membresía</h3>
      ) : (
        <>
          <h3>💰 Valor actual: ${currentM.price}</h3>
          <h3>
            📅 Vigente desde: {new Date(currentM.dateFrom).toLocaleDateString()}
          </h3>
          <h3>⏱️ Hora: {new Date(currentM.dateFrom).toLocaleTimeString()}</h3>
        </>
      )}

      {showHistory && <MembershipHistory memberships={memberships} />}

      {editing && (
        <MembershipForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}

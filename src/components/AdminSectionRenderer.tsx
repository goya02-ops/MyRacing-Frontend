import { lazy, Suspense } from 'react';
import type { AdminSection } from '../hooks/useAdminSection';

// Lazy load de TODOS los componentes admin (se cargan bajo demanda)
const CategoryAdmin = lazy(() => import('../pages/CategoryAdmin'));
const CircuitAdmin = lazy(() => import('../pages/CircuitAdmin'));
const CombinationAdmin = lazy(() => import('../pages/CombinationAdmin'));
const MembershipAdmin = lazy(() => import('../pages/MembershipAdmin'));
const SimulatorAdmin = lazy(() => import('../pages/SimulatorAdmin'));
const UserAdmin = lazy(() => import('../pages/UserAdmin'));
const UserRacesAdmin = lazy(() => import('../pages/UserRacesAdmin'));

type Props = {
  section: AdminSection;
};

export default function AdminSectionRenderer({ section }: Props) {
  // Función helper para obtener el componente según la sección
  const getComponent = () => {
    switch (section) {
      case 'categories':
        return <CategoryAdmin />;
      case 'circuits':
        return <CircuitAdmin />;
      case 'combinations':
        return <CombinationAdmin />;
      case 'memberships':
        return <MembershipAdmin />;
      case 'simulators':
        return <SimulatorAdmin />;
      case 'users':
        return <UserAdmin />;
      case 'races':
        return <UserRacesAdmin />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  // Mapeo de nombres de secciones para el mensaje de carga
  const sectionNames: Record<AdminSection, string> = {
    categories: 'Categorías',
    circuits: 'Circuitos',
    combinations: 'Combinaciones',
    memberships: 'Membresías',
    simulators: 'Simuladores',
    users: 'Usuarios',
    races: 'Carreras por Usuario',
  };

  return (
    <Suspense 
      fallback={
        <div>
          Cargando {sectionNames[section]}...
        </div>
      }
    >
      {getComponent()}
    </Suspense>
  );
}
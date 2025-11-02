import { lazy, Suspense } from 'react';
import type { AdminSection } from '../hooks/useAdminSection';

const CategoryAdmin = lazy(
  () => import('../../CategoryAdmin/pages/CategoryAdmin')
);
const CircuitAdmin = lazy(
  () => import('../../CircuitAdmin/pages/CircuitAdmin')
);
const CombinationAdmin = lazy(
  () => import('../../CombinationAdmin/pages/CombinationAdmin')
);
const MembershipAdmin = lazy(
  () => import('../../MembershipAdmin/pages/MembershipAdmin')
);
const SimulatorAdmin = lazy(
  () => import('../../SimulatorAdmin/pages/SimulatorAdmin')
);
const UserAdmin = lazy(() => import('../../UserAdmin/pages/UserAdmin'));
const UserRacesAdmin = lazy(
  () => import('../../UserRacesAdmin/pages/UserRacesAdmin')
);

type Props = {
  section: AdminSection;
};

export default function AdminSectionRenderer({ section }: Props) {
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
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-400">
            Cargando sección de {sectionNames[section]}...
          </p>
        </div>
      }
    >
      {getComponent()}
    </Suspense>
  );
}

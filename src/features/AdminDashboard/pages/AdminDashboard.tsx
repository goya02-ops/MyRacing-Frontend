import { useAdminSection } from '../hooks/useAdminSection';
import AdminSectionSwitcher from '../components/AdminSectionSwitcher';
import AdminSectionRenderer from '../components/AdminSectionRenderer';

export default function AdminDashboard() {
  const { activeSection, setActiveSection } = useAdminSection();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 text-gray-200">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      <AdminSectionSwitcher
        active={activeSection}
        onChange={setActiveSection}
      />

      <div className="mt-6">
        <AdminSectionRenderer section={activeSection} />
      </div>
    </div>
  );
}

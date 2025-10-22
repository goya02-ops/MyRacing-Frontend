import { useAdminSection } from '../hooks/useAdminSection';
import AdminSectionSwitcher from '../components/AdminSectionSwitcher';
import AdminSectionRenderer from '../components/AdminSectionRenderer';

export default function AdminDashboard() {
  const { activeSection, setActiveSection } = useAdminSection();

  return (
    <section>
      <h1 >Panel de Administración</h1>
      
      <AdminSectionSwitcher 
        active={activeSection} 
        onChange={setActiveSection} 
      />
      
      <AdminSectionRenderer section={activeSection} />
    </section>
  );
}
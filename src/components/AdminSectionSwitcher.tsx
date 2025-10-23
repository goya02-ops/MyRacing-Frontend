import type { AdminSection } from '../hooks/useAdminSection';
import { Button } from './tremor/Button'; 

type Props = {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
};

export default function AdminSectionSwitcher({ active, onChange }: Props) {
  const sections: { key: AdminSection; label: string }[] = [
    { key: 'users', label: 'Usuarios' },
    { key: 'categories', label: 'Categorías' },
    { key: 'circuits', label: 'Circuitos' },
    { key: 'simulators', label: 'Simuladores' },
    { key: 'combinations', label: 'Combinaciones' },
    { key: 'memberships', label: 'Membresías' },
    { key: 'races', label: 'Carreras por Usuario' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {sections.map((s) => (
        <Button 
          key={s.key} 
          onClick={() => onChange(s.key)}
          variant={active === s.key ? 'primary' : 'ghost'}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
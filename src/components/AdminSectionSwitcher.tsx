import type { AdminSection } from '../hooks/useAdminSection';

type Props = {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
};

export default function AdminSectionSwitcher({ active, onChange }: Props) {
  const sections: { key: AdminSection; label: string }[] = [
    { key: 'categories', label: 'Categorías' },
    { key: 'circuits', label: 'Circuitos' },
    { key: 'combinations', label: 'Combinaciones' },
    { key: 'memberships', label: 'Membresías' },
    { key: 'simulators', label: 'Simuladores' },
    { key: 'users', label: 'Usuarios' },
    { key: 'races', label: 'Carreras por Usuario' },
  ];

  return (
    <nav>
      {sections.map((s) => (
        <button 
          key={s.key} 
          onClick={() => onChange(s.key)}
          disabled={active === s.key}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}
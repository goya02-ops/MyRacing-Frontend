import { useNavigate, useLocation } from 'react-router-dom';

export type AdminSection =
  | 'categories'
  | 'circuits'
  | 'combinations'
  | 'memberships'
  | 'simulators'
  | 'users'
  | 'races';

const validSections: AdminSection[] = [
  'categories',
  'circuits',
  'combinations',
  'memberships',
  'simulators',
  'users',
  'races',
];

function getSectionFromURL(search: string, initial: AdminSection): AdminSection {
  const params = new URLSearchParams(search);
  const section = params.get('section') as AdminSection;

  // Validamos que esa section que está as AdminSection sea válida
  return validSections.includes(section) ? section : initial;
}

export function useAdminSection(initial: AdminSection = 'combinations') {
  const navigate = useNavigate();
  const location = useLocation();

  // Sección derivada directamente de la URL, sin estado local
  const activeSection = getSectionFromURL(location.search, initial);

  const changeSectionWithURL = (section: AdminSection) => {
    navigate(`?section=${section}`, { replace: true });
  };

  return { activeSection, setActiveSection: changeSectionWithURL };}

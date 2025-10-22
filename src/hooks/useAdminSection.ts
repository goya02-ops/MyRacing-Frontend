import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type AdminSection =
  | 'categories'
  | 'circuits'
  | 'combinations'
  | 'memberships'
  | 'simulators'
  | 'users'
  | 'races';

export function useAdminSection(initial: AdminSection = 'combinations') {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Leemos de la URL al cargar
  const getSectionFromURL = (): AdminSection => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') as AdminSection;

    // Validamos que esa section que está as AdminSection sea válida
    const validSections: AdminSection[] = [
      'categories',
      'circuits',
      'combinations',
      'memberships',
      'simulators',
      'users',
      'races',
    ];
    
    return validSections.includes(section) ? section : initial;
  };

  const [activeSection, setActiveSection] = useState<AdminSection>(getSectionFromURL);

  const changeSectionWithURL = (section: AdminSection) => {
    setActiveSection(section);
    navigate(`?section=${section}`, { replace: true });
  };

  useEffect(() => {
    const newSection = getSectionFromURL();
    if (newSection !== activeSection) {
      setActiveSection(newSection);
    }
  }, [location.search]);

  return { activeSection, setActiveSection: changeSectionWithURL };}
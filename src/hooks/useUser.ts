export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return ctx;
}

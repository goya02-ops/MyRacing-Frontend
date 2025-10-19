import './index.css';
import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthButtons } from './components/AuthButtons.tsx';
import { useUser } from './context/UserContext.tsx';

const SignIn = lazy(() => import('./pages/SignIn.tsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const MembershipAdmin = lazy(() => import('./pages/MembershipAdmin.tsx'));
const SimulatorAdmin = lazy(() => import('./pages/SimulatorAdmin.tsx'));
const CircuitAdmin = lazy(() => import('./pages/CircuitAdmin.tsx'));
const CategoryAdmin = lazy(() => import('./pages/CategoryAdmin.tsx'));
const UserRacesAdmin = lazy(() => import('./pages/UserRacesAdmin.tsx'));
const LogIn = lazy(() => import('./pages/LogIn.tsx'));
const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));
const CombinationAdmin = lazy(() => import('./pages/CombinationAdmin.tsx'));
const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));

function AppContent() {
  const { user } = useUser();

  return (
    <>
      <nav>
        <Link to="/">
          <h1>My Racing</h1>
        </Link>
        <Link to="/my-profile">Mi Perfil</Link> |{' '}
        <Link to="/user-admin">Gestión de usuarios</Link> |{' '}
        <Link to="/circuit-admin">Administrador de circuitos</Link> |{' '}
        <Link to="/category-admin">Administrador de categorías</Link> |{' '}
        <Link to="/simulator-admin">Administrador de simuladores</Link> |{' '}
        <Link to="/combination-admin">Administrador de combinaciones</Link> |{' '}
        <Link to="/user-races-admin">
          Administrador de carreras por usuario
        </Link>{' '}
        |{' '}
        <Link to="/membership-managment">Administar valor de membresía</Link> |{' '}
        <Link to="/available-races">Carreras Disponibles</Link>
        
        {!user ? (
          <>
            {' '} | <Link to="/login-register">Iniciar Sesión / Registrarse</Link>
          </>
        ) : (
          <>
            {' '} | <AuthButtons />
          </>
        )}
      </nav>
      
      <Routes>
        <Route
          path="/user-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circuit-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <CircuitAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <CategoryAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulator-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <SimulatorAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/combination-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <CombinationAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-races-admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserRacesAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership-managment"
          element={
            <ProtectedRoute requiredRole="admin">
              <MembershipAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="/login-register" element={<LogIn />} />
        <Route path="/my-profile" element={<UserProfile />} />
        <Route path="/available-races" element={<AvailableRaces />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
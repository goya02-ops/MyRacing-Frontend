import './index.css';
import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthButtons } from './components/AuthButtons.tsx';
import { useUser } from './context/UserContext.tsx';

const SignIn = lazy(() => import('./pages/SignIn.tsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));

const LogIn = lazy(() => import('./pages/LogIn.tsx'));
const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));

const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));

function AppContent() {
  const { user } = useUser();

  return (
    <>
      <nav>
        <Link to="/">
          <h1>My Racing</h1>
        </Link>
        <Link to="/my-profile">Mi Perfil</Link> |{' '}
        <Link to="/available-races">Carreras Disponibles</Link> |{' '}
       
        {user?.type === 'admin' && (
          <>
            {' '} | <Link to="/admin-dashboard">Panel de Administración</Link>
          </>
        )}

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
        <Route path="/login-register" element={<LogIn />} />
        <Route path="/my-profile" element={<UserProfile />} />
        <Route path="/available-races" element={<AvailableRaces />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
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
import './index.css';
import { lazy, Suspense } from 'react'; // <-- Asegúrate de importar Suspense
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Navbar } from './components/NavBar.tsx';
import { DecorativeBackground } from './components/DecorativeBackground.tsx';

// --- INICIO DE CAMBIOS ---
// 1. Borramos las importaciones de LogIn y SignIn
// const SignIn = lazy(() => import('./pages/SignIn.tsx'));
// const LogIn = lazy(() => import('./pages/LogIn.tsx'));
// 2. Importamos la nueva página de autenticación
const AuthPage = lazy(() => import('./pages/AuthPage'));
// --- FIN DE CAMBIOS ---

const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));
const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));

function AppContent() {
  return (
    <div className="bg-gray-900 min-h-screen relative isolate">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 3. Envolvemos las Rutas en Suspense */}
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-20 text-gray-400">
              Cargando página...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AvailableRaces />} />
            <Route
              path="/user-admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAdmin />
                </ProtectedRoute>
              }
            />
            
            {/* --- INICIO DE CAMBIOS --- */}
            {/* 4. Apuntamos todas las rutas de auth al nuevo AuthPage */}
            <Route path="/login-register" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signin" element={<AuthPage />} />
            {/* --- FIN DE CAMBIOS --- */}

            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <DecorativeBackground />
    </div>
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
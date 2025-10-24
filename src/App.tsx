import './index.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Navbar } from './components/NavBar.tsx';
import { DecorativeBackground } from './components/DecorativeBackground.tsx';

// --- Tus imports de lazy components ---
const AuthPage = lazy(() => import('./pages/AuthPage'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));
const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));

function AppContent() {
  return (
    // 1. Contenedor principal: Al menos la altura de la pantalla, sin overflow-hidden aquí.
    // 'relative isolate' es para el DecorativeBackground.
    <div className="bg-gray-900 min-h-screen relative isolate">
      {/* 2. DecorativeBackground como hermano del contenido, con z-index negativo. */}
      {/* Esto asegura que esté detrás de todo. */}
      <DecorativeBackground />

      {/* 3. Contenedor del contenido (Navbar, Main, Footer): Es un flex container en columna. */}
      {/* Ocupa al menos la altura de la pantalla y se posiciona encima del fondo. */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* 4. Main content: Crece con su contenido. Sin overflow-y-auto aquí. */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
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

              <Route path="/login-register" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signin" element={<AuthPage />} />

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

        <footer className="mt-96" />
      </div>
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

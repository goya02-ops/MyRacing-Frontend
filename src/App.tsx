import './index.css';
import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Navbar } from './components/NavBar.tsx';

const SignIn = lazy(() => import('./pages/SignIn.tsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));
const LogIn = lazy(() => import('./pages/LogIn.tsx'));
const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));
const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));

function AppContent() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          <Route path="/login-register" element={<LogIn />} />
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
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
      </main>
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

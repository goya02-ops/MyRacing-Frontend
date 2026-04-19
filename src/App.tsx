import './index.css';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { setAuthFailureHandler } from './services/apiClient';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Navbar } from './components/NavBar.tsx';
import { DecorativeBackground } from './components/DecorativeBackground.tsx';
import { Footer } from './components/Footer.tsx';
import { Toaster } from './components/tremor/toast/Toaster.tsx'; 

const AuthPage = lazy(() => import('./features/Auth/pages/AuthPage.tsx'));
const PasswordRecoveryPage = lazy(
  () => import('./features/Auth/pages/PasswordRecoveryPage.tsx')
);
const ResetPasswordPage = lazy(
  () => import('./features/Auth/pages/ResetPasswordPage.tsx')
);
const MembershipPayment = lazy(
  () => import('./features/MembershipPayment/pages/membershipPayment.tsx')
);
const UserProfile = lazy(
  () => import('./features/UserProfile/pages/UserProfile.tsx')
);
const AvailableRaces = lazy(
  () => import('./features/AvailableRaces/pages/AvailableRaces.tsx')
);
const UserAdmin = lazy(
  () => import('./features/UserAdmin/pages/UserAdmin.tsx')
);
const AdminDashboard = lazy(
  () => import('./features/AdminDashboard/pages/AdminDashboard.tsx')
);

const PaymentStatus = lazy(
  () => import('./features/MembershipPayment/pages/paymentStatus.tsx')
);

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    setAuthFailureHandler(() => {
      navigate('/login');
    });
  }, [navigate]);

  return (
    <div className="bg-gray-900 min-h-screen relative isolate">
      <DecorativeBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-20 text-gray-400">
                Cargando páginas...
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
              <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/membership-payment"
                element={
                  <ProtectedRoute>
                    <MembershipPayment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment-status"
                element={
                  <ProtectedRoute>
                    <PaymentStatus />
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

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

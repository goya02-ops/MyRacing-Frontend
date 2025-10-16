import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const UserProfile = lazy(() => import('./pages/UserProfile.tsx'));

const MembershipAdmin = lazy(() => import('./pages/MembershipAdmin.tsx'));
const SimulatorAdmin = lazy(() => import('./pages/SimulatorAdmin.tsx'));
const CircuitAdmin = lazy(() => import('./pages/CircuitAdmin.tsx'));
const CategoryAdmin = lazy(() => import('./pages/CategoryAdmin.tsx'));
const UserRacesAdmin = lazy(() => import('./pages/UserRacesAdmin.tsx'));
const LoginRegister = lazy(() => import('./pages/LoginRegister.tsx'));


const AvailableRaces = lazy(() => import('./pages/AvailableRaces.tsx'));
const CombinationAdmin = lazy(() => import('./pages/CombinationAdmin.tsx'));
const UserAdmin = lazy(() => import('./pages/UserAdmin.tsx'));

function App() {
  

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">
          {' '}
          <h1>My Racing</h1>
        </Link>
        
        <Link to="/my-profile">Mi Perfil</Link> |{' '} 
        
        <Link to="/user-admin">Gestión de usuarios</Link> |{' '}
        <Link to="/circuit-admin">Administrador de circuitos</Link> |{' '}
        <Link to="/category-admin">Administrador de categorías</Link> |{' '}
        <Link to="/simulator-admin">Administrador de simuladores</Link> |{' '}
        <Link to="/combination-admin">Administrador de combinaciones</Link> |{' '}
        <Link to="/login-register">Iniciar Sesión / Registrarse</Link> |{' '}
        
        <Link to="/user-races-admin">
          Administrador de carreras por usuario
        </Link>{' '}
        |{' '}

        | <Link to="/membership-managment">Administar valor de membresía</Link>|{' '}
        <Link to="/available-races">Carreras Disponibles</Link>
      </nav>
    
      <Routes>
        

        <Route path="/user-admin" element={<UserAdmin />} />
        <Route path="/circuit-admin" element={<CircuitAdmin />} />
        <Route path="/category-admin" element={<CategoryAdmin />} />
        <Route path="/simulator-admin" element={<SimulatorAdmin />} />
        <Route path="/combination-admin" element={<CombinationAdmin />} />
        <Route path="/user-races-admin" element={<UserRacesAdmin />} />
        <Route path="/login-register" element={<LoginRegister />} />
        <Route path="/my-profile" element={<UserProfile />} />

        <Route path="/membership-managment" element={<MembershipAdmin />} />
        <Route path="/available-races" element={<AvailableRaces />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

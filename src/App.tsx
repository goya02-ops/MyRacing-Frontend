import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const MembershipAdmin = lazy(() => import('./pages/MembershipAdmin.tsx'));
const SimulatorAdmin = lazy(() => import('./pages/SimulatorAdmin.tsx'));
const CircuitAdmin = lazy(() => import('./pages/CircuitAdmin.tsx'));
const CategoryAdmin = lazy(() => import('./pages/CategoryAdmin.tsx'));
const CircuitVersionAdmin = lazy(
  () => import('./pages/CircuitVersionAdmin.tsx')
);
const CategoryVersionAdmin = lazy(
  () => import('./pages/CategoryVersionAdmin.tsx')
);

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">
          {' '}
          <h1>My Racing</h1>
        </Link>
        <Link to="/circuit-admin">Administrador de circuitos</Link> |{' '}
        <Link to="/category-admin">Administrador de categorías</Link> |{' '}
        <Link to="/simulator-admin">Administrador de simuladores</Link> |{' '}
        <Link to="/category-version-admin">
          Administrador de versiones de categorías
        </Link>
        |{' '}
        <Link to="/circuit-version-admin">
          Administrador de versiones de circuitos
        </Link>
        | <Link to="/membership-managment">Administar valor de membresía</Link>
      </nav>

      <Routes>
        <Route path="/circuit-admin" element={<CircuitAdmin />} />
        <Route path="/category-admin" element={<CategoryAdmin />} />
        <Route path="/simulator-admin" element={<SimulatorAdmin />} />
        <Route
          path="/circuit-version-admin"
          element={<CircuitVersionAdmin />}
        />
        <Route
          path="/category-version-admin"
          element={<CategoryVersionAdmin />}
        />
        <Route path="/membership-managment" element={<MembershipAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

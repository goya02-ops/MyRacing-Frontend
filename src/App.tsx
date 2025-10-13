import { Routes, Route } from 'react-router';
import SimulatorAdmin from './components/SimulatorAdmin.tsx';
import CircuitAdmin from './components/CircuitAdmin.tsx';
import CategoryAdmin from './components/CategoryAdmin.tsx';
import CircuitVersionAdmin from './components/CircuitVersionAdmin.tsx';
import CategoryVersionAdmin from './components/CategoryVersionAdmin.tsx';
import CombinationAdmin from './components/CombinationAdmin.tsx';

function App() {
  return (
    <Routes>
      <Route path="/circuit-admin" element={<CircuitAdmin />} />
      <Route path="/category-admin" element={<CategoryAdmin />} />
      <Route path="/simulator-admin" element={<SimulatorAdmin />} />
      <Route path="/circuit-version-admin" element={<CircuitVersionAdmin />} />
      <Route path="/combination-admin" element={<CombinationAdmin />} />
      <Route
        path="/category-version-admin"
        element={<CategoryVersionAdmin />}
      />
    </Routes>
  );
}

export default App;

import { Routes, Route } from 'react-router';
import SimulatorAdmin from './components/SimulatorAdmin.tsx';
import CircuitAdmin from './components/CircuitAdmin.tsx';
import CategoryAdmin from './components/CategoryAdmin.tsx';
import CircuitVersionAdmin from './components/CircuitVersionAdmin.tsx';

function App() {
  return (
    <Routes>
      <Route path="/circuit-admin" element={<CircuitAdmin />} />
      <Route path="/category-admin" element={<CategoryAdmin />} />
      <Route path="/simulator-admin" element={<SimulatorAdmin />} />
      <Route path="circuit-version-admin" element={<CircuitVersionAdmin />} />
    </Routes>
  );
}

export default App;

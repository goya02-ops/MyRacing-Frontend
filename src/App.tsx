import { Routes, Route } from 'react-router';
import SimulatorAdmin from './components/SimulatorAdmin.tsx';
import CircuitAdmin from './components/CircuitAdmin.tsx';
import CategoryAdmin from './components/CategoryAdmin.tsx';

function App() {
  return (
    <Routes>
      <Route path="/circuit-admin" element={<CircuitAdmin />} />
      <Route path="/category-admin" element={<CategoryAdmin />} />
      <Route path="/simulator-admin" element={<SimulatorAdmin />} />
    </Routes>
  );
}

export default App;

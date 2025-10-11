// src/main.tsx

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App.tsx';
import SimulatorAdmin from './components/SimulatorAdmin.tsx';
import CircuitAdmin from './components/CircuitAdmin.tsx';
import CategoryAdmin from './components/CategoryAdmin.tsx';
import CategoryVersionAdmin from './components/CategoryVersionAdmin.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/circuit-admin" element={<CircuitAdmin />} />
        <Route path="/category-admin" element={<CategoryAdmin />} />
        <Route path="/simulator-admin" element={<SimulatorAdmin />} />
        <Route path="/category-version-admin" element={<CategoryVersionAdmin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SimulatorAdmin from './components/SimuladorAdmin.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SimulatorAdmin />
  </StrictMode>
);

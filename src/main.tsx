import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App.tsx';
import CircuitAdmin from './components/CircuitAdmin.tsx';
import CategoryAdmin from './components/CategoryAdmin.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/circuit-admin" element={<CircuitAdmin />} />
        <Route path="/category-admin" element={<CategoryAdmin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

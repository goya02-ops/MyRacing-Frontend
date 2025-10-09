import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App.tsx';
import CircuitAdmin from './components/circuit-admin.tsx';
//import CategoryAdmin from './components/category-admin.tsx';

//<Route path="/category-admin" element={<CategoryAdmin />} />
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/circuit-admin" element={<CircuitAdmin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

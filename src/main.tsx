// src/main.tsx

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { UserProvider } from './context/user.tsx';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);

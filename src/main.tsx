import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminConsole } from './components/AdminConsole.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {window.location.pathname === '/admin' ? <AdminConsole /> : <App />}
  </StrictMode>,
);

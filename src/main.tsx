import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster, ToastProvider } from './components/ui/toaster';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
        <Toaster />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
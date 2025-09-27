import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Import all the context providers
import { AuthProvider } from './contexts/AuthContext.jsx';
import { UserProfileProvider } from './contexts/UserProfileContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';

// 2. Import the standard PWA registration function for Vite
import { registerSW } from 'virtual:pwa-register';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

// 3. Wrap the App component with the context providers
root.render(
  <React.StrictMode>
    <AuthProvider>
      <UserProfileProvider>
        <LanguageProvider>
          <BrowserRouter>
          <App />
          </BrowserRouter>
        </LanguageProvider>
      </UserProfileProvider>
    </AuthProvider>
  </React.StrictMode>,
);

// 4. Call the PWA registration function
registerSW({ immediate: true });

// Prevent right-click / long press
document.addEventListener('contextmenu', (e) => e.preventDefault());


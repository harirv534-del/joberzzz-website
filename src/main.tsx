import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AuthProvider} from './context/AuthContext.tsx';
import {NotificationProvider} from './context/NotificationContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
);

// Register Service Worker for Google Play Store (TWA) and Apple App Store (PWA) compliance
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Joberzzz PWA service worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service worker registration note:', error);
      });
  });
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// registerType: 'autoUpdate' installs and activates a new service worker
// silently, but a tab/standalone app that's already open keeps running the
// JS it already loaded until it reloads. iOS home screen apps often resume
// a suspended session on relaunch instead of doing a real reload, so a new
// version can otherwise sit installed-but-unused indefinitely. Reloading
// once when the new worker takes control, and re-checking whenever the app
// comes back to the foreground, makes updates actually show up.
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
    },
  });

  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

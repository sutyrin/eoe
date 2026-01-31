/**
 * PWA service worker registration.
 * @vite-pwa/astro auto-generates the service worker, this script
 * handles the registration lifecycle (install, update, activate).
 */

// @vite-pwa/astro provides a virtual module for registration
// This will be auto-handled by the plugin, but we expose a manual hook
// for showing update-available notifications.

export function setupPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Service worker is auto-registered by @vite-pwa/astro
      // Listen for updates
      navigator.serviceWorker.ready.then((registration) => {
        console.log('[PWA] Service worker active');

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
      });
    });
  }
}

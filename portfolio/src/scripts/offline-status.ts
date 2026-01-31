/**
 * Online/offline detection and storage quota monitoring.
 * Dispatches custom events that OfflineIndicator.astro listens to.
 */
import { getStorageEstimate } from './db';

export interface OfflineState {
  isOnline: boolean;
  storagePercent: number;
  storageWarning: boolean; // true if >80% used
}

const STORAGE_WARNING_THRESHOLD = 80; // percent

export function setupOfflineDetection() {
  // Dispatch initial state
  updateStatus();

  // Listen for network changes
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // Check storage quota every 5 minutes
  setInterval(checkStorage, 5 * 60 * 1000);
  checkStorage(); // Initial check
}

function updateStatus() {
  const event = new CustomEvent('eoe:offline-status', {
    detail: { isOnline: navigator.onLine }
  });
  window.dispatchEvent(event);
}

async function checkStorage() {
  const estimate = await getStorageEstimate();
  const event = new CustomEvent('eoe:storage-status', {
    detail: {
      percentUsed: estimate.percentUsed,
      warning: estimate.percentUsed > STORAGE_WARNING_THRESHOLD,
      usageMB: Math.round(estimate.usage / (1024 * 1024)),
      quotaMB: Math.round(estimate.quota / (1024 * 1024))
    }
  });
  window.dispatchEvent(event);
}

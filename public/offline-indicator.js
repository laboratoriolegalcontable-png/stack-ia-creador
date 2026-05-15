/**
 * Offline Indicator — muestra estado de conexión y cola de sincronización
 * @module offline-indicator
 */

const QUEUE_KEY = 'kairos:sync:queue';

export function getSyncQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
}

export function addToSyncQueue(action) {
  const queue = getSyncQueue();
  queue.push({ ...action, ts: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
}

export function clearSyncQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

function getBanner() {
  let el = document.getElementById('offline-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'offline-banner';
    el.style.cssText = [
      'position:fixed;top:0;left:0;right:0;z-index:10010',
      'padding:6px 16px;font-family:monospace;font-size:12px',
      'display:flex;align-items:center;justify-content:space-between',
      'transition:all 0.3s ease',
    ].join(';');
    document.body.prepend(el);
  }
  return el;
}

function updateBanner(online) {
  const queue  = getSyncQueue();
  const banner = getBanner();
  if (online) {
    banner.style.background = '#052e16';
    banner.style.color = '#86efac';
    banner.innerHTML = `<span>🟢 Conectado${queue.length ? ` · ${queue.length} acciones pendientes de sincronizar` : ''}</span>`;
    setTimeout(() => banner.remove(), 3000);
  } else {
    banner.style.background = '#450a0a';
    banner.style.color = '#fca5a5';
    banner.innerHTML = `<span>🔴 Sin conexión · Los cambios se guardan localmente</span>`;
  }
}

export function initOfflineIndicator() {
  window.addEventListener('offline', () => updateBanner(false));
  window.addEventListener('online',  () => updateBanner(true));
  if (!navigator.onLine) updateBanner(false);
}

/**
 * Bridge Mode — comunicación cross-tab via BroadcastChannel
 * Equivalente browser de `claude --bridge`
 * @module bridge
 */
import { getFlags } from './flags.js';

const CHANNEL_NAME = 'kairos-bridge';
const SECRET_KEY   = 'bridge:secret';

/** @type {BroadcastChannel|null} */
let channel = null;
/** @type {Map<string, Function>} */
const handlers = new Map();

/**
 * @param {string} command
 * @param {Record<string,unknown>} [args]
 */
export function sendBridgeCommand(command, args = {}) {
  if (!getFlags().BRIDGE_ENABLED) return;
  if (!channel) return;
  const payload = { command, args, ts: Date.now(), origin: location.href };
  channel.postMessage(payload);
}

/**
 * @param {string} command
 * @param {(args: Record<string,unknown>) => void} handler
 */
export function onBridgeCommand(command, handler) {
  handlers.set(command, handler);
}

/** @returns {boolean} */
export function isBridgeOpen() {
  return !!channel;
}

export function initBridge() {
  if (!getFlags().BRIDGE_ENABLED) return;
  if (typeof BroadcastChannel === 'undefined') return;

  channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event) => {
    const { command, args, ts } = event.data || {};
    if (!command || !ts) return;
    // ignorar mensajes de más de 30s
    if (Date.now() - ts > 30_000) return;

    const handler = handlers.get(command);
    if (handler) {
      try { handler(args || {}); }
      catch (e) { console.warn('[bridge] error en handler:', e); }
    }
  };

  // Registrar comandos por defecto
  onBridgeCommand('ping', () => {
    sendBridgeCommand('pong', { ts: Date.now() });
  });

  onBridgeCommand('gc', () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('kairos:event:'));
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('kairos:sessions', '0');
    console.info(`[bridge:gc] eliminadas ${keys.length} claves`);
  });

  onBridgeCommand('status', () => {
    const sessions = Number(localStorage.getItem('kairos:sessions')) || 0;
    const lastCycle = localStorage.getItem('kairos:lastCycle');
    sendBridgeCommand('status:reply', { sessions, lastCycle, url: location.href });
  });

  console.info('[bridge] BroadcastChannel activo en canal:', CHANNEL_NAME);
}

export function closeBridge() {
  channel?.close();
  channel = null;
}

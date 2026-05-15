/**
 * Hotkeys — atajos de teclado para slash commands KAIROS
 * Ctrl+D = /dream, Ctrl+G = /gc, Ctrl+S = /stats,
 * Ctrl+T = /timeline, Ctrl+E = /export, Ctrl+K = /ctx-viz
 * @module hotkeys
 */
import { getFlags } from './flags.js';

/** @type {Map<string, {key: string, description: string, action: () => void}>} */
const HOTKEYS = new Map();

/**
 * @param {string} combo  e.g. 'ctrl+d'
 * @param {string} description
 * @param {() => void} action
 */
export function registerHotkey(combo, description, action) {
  HOTKEYS.set(combo.toLowerCase(), { key: combo, description, action });
}

export function initHotkeys() {
  if (!getFlags().HOTKEYS_ENABLED) return;

  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey)   parts.push('alt');
    parts.push(e.key.toLowerCase());
    const combo = parts.join('+');

    const hotkey = HOTKEYS.get(combo);
    if (hotkey) {
      e.preventDefault();
      hotkey.action();
    }
  });
}

export function showHotkeysHelp() {
  const existing = document.getElementById('hotkeys-help');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'hotkeys-help';
  panel.style.cssText = [
    'position:fixed;bottom:20px;right:20px;width:260px',
    'background:#0f172a;border:1px solid #334155;border-radius:10px',
    'padding:14px;font-family:monospace;font-size:11px;color:#e2e8f0',
    'box-shadow:0 8px 24px rgba(0,0,0,0.5);z-index:9996',
  ].join(';');

  const rows = [...HOTKEYS.entries()]
    .map(([, hk]) => `<div style="display:flex;justify-content:space-between;padding:3px 0">
      <kbd style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#a5b4fc">${hk.key}</kbd>
      <span style="color:#94a3b8">${hk.description}</span>
    </div>`).join('');

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px">
      <span style="color:#818cf8;font-weight:700">&#x2328;&#xFE0F; Hotkeys</span>
      <button onclick="this.closest('#hotkeys-help').remove()"
        style="background:none;border:none;color:#64748b;cursor:pointer">&times;</button>
    </div>
    ${rows}
    <div style="color:#475569;margin-top:8px">Ctrl+? para mostrar esta ayuda</div>
  `;
  document.body.appendChild(panel);
  setTimeout(() => panel.remove(), 10_000);
}

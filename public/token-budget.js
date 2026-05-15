/**
 * Token Budget Monitor — rastrea uso de localStorage como proxy de contexto
 * Muestra advertencia cuando el uso supera 80% de 5MB
 * @module token-budget
 */
import { getFlags } from './flags.js';

const MAX_BYTES    = 5 * 1024 * 1024; // 5MB localStorage limit
const WARN_RATIO   = 0.80;
const CRIT_RATIO   = 0.95;
const BUDGET_KEY   = 'token-budget:daily';
const TOKEN_RATIO  = 4; // bytes por token estimado

export function getBudgetStats() {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key) || '';
    used += key.length + val.length;
  }
  const ratio  = used / MAX_BYTES;
  const tokens = Math.round(used / TOKEN_RATIO);
  const status = ratio >= CRIT_RATIO ? 'critical' : ratio >= WARN_RATIO ? 'warning' : 'ok';
  return { used, max: MAX_BYTES, ratio, tokens, status };
}

function getOrCreateBanner() {
  let el = document.getElementById('token-budget-banner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'token-budget-banner';
    el.style.cssText = [
      'position:fixed;top:0;left:0;right:0;z-index:10000',
      'padding:8px 16px;font-family:sans-serif;font-size:13px',
      'display:flex;align-items:center;justify-content:space-between',
    ].join(';');
    document.body.prepend(el);
  }
  return el;
}

export function checkTokenBudget() {
  if (!getFlags().TOKEN_BUDGET_ENABLED) return;

  const { ratio, used, tokens, status } = getBudgetStats();
  if (status === 'ok') {
    document.getElementById('token-budget-banner')?.remove();
    return;
  }

  const pct    = Math.round(ratio * 100);
  const color  = status === 'critical' ? '#dc2626' : '#d97706';
  const icon   = status === 'critical' ? '🔴' : '🟡';
  const banner = getOrCreateBanner();
  banner.style.background = color;
  banner.style.color = '#fff';
  banner.innerHTML = `
    <span>${icon} <strong>Token Budget ${status === 'critical' ? 'CRÍTICO' : 'AVISO'}</strong>:
      ${pct}% del contexto usado (~${tokens.toLocaleString()} tokens estimados).
      Considera ejecutar <code>/gc</code> para liberar memoria.</span>
    <button onclick="this.parentElement.remove()"
      style="background:rgba(255,255,255,0.2);border:none;color:#fff;
             padding:4px 10px;border-radius:4px;cursor:pointer">✕</button>
  `;
}

export function initTokenBudget() {
  if (!getFlags().TOKEN_BUDGET_ENABLED) return;
  checkTokenBudget();
  // Re-verificar cada 2 minutos
  setInterval(checkTokenBudget, 2 * 60 * 1000);
}
